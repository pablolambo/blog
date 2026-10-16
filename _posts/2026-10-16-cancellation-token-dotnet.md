---
title: "CancellationToken in .NET: stop work nobody is waiting for"
date: 2026-10-16
author: Paweł Frankowski
category: dotnet
tags: [dotnet, csharp, async, cancellationtoken, aspnetcore]
reading_time: 6
---

> **TL;DR**
>
> - A `CancellationToken` is a signal that says "stop if you can". It does not stop anything by itself.
> - `CancellationTokenSource` creates and triggers the signal. You pass `cts.Token` to every async call.
> - In ASP.NET Core, add a `CancellationToken` parameter to your endpoint or action. It is bound to `HttpContext.RequestAborted`, so it fires when the client goes away. Pass it to every database and HTTP call.
> - Cancellation is not a rollback. Whatever already happened stays done.
> - If one method in the chain accepts the token but doesn't pass it on, the chain is broken and the work keeps running.

## Why you need it

A user clicks "Generate report" and closes the tab two seconds later. Unless you tell it otherwise, your server keeps running the query and the downstream calls for a result nobody will read. Under load, that is wasted threads, connections and database time.

A cancellation token lets the caller say "I'm no longer interested", so the work can stop early. .NET calls this *cooperative* cancellation. The documentation puts it this way: ["Cancellation is cooperative and is not forced on the listener. The listener determines how to gracefully terminate in response to a cancellation request."](https://learn.microsoft.com/dotnet/standard/threading/cancellation-in-managed-threads)

Two types are involved:

- `CancellationTokenSource` is the remote control. It creates the token and can cancel it with `Cancel()` or `CancelAfter()`.
- `CancellationToken` is the signal you pass around. Code can read it, but it cannot trigger it.

## The smallest example

Cancel a 30 second job after 5 seconds:

```csharp
using var cts = new CancellationTokenSource();
cts.CancelAfter(TimeSpan.FromSeconds(5));

try
{
    Console.WriteLine("Starting a 30 second job...");
    await Task.Delay(TimeSpan.FromSeconds(30), cts.Token);
    Console.WriteLine("Job finished.");
}
catch (OperationCanceledException)
{
    Console.WriteLine("Job was cancelled after 5 seconds.");
}
```

Running it prints this and exits after about 6 seconds, not 30:

```
Starting a 30 second job...
Job was cancelled after 5 seconds.
```

What happens here:

- [`CancelAfter`](https://learn.microsoft.com/dotnet/api/system.threading.cancellationtokensource.cancelafter) schedules the cancellation. The countdown starts when you call it.
- `Task.Delay` watches the token. When the token fires, it throws a `TaskCanceledException`, which derives from `OperationCanceledException`. Catch the base type.
- `CancellationTokenSource` is `IDisposable`, hence the `using`.

## The real world: HttpContext

In a web app you rarely create the source yourself. ASP.NET Core gives you a token that fires when the client disconnects: [`HttpContext.RequestAborted`](https://learn.microsoft.com/aspnet/core/fundamentals/use-http-context#requestaborted). The documentation says it should be passed to long-running tasks so they can be cancelled if the request is aborted, for example a database query or an HTTP request.

You don't even need to touch `HttpContext`. A `CancellationToken` parameter on a [minimal API handler](https://learn.microsoft.com/aspnet/core/fundamentals/use-http-context#requestaborted) or a [controller action](https://learn.microsoft.com/aspnet/core/mvc/models/model-binding#cancellationtoken) is bound to `RequestAborted` automatically.

Here is an endpoint that builds a report by calling a slow pricing service:

```csharp
app.MapGet("/report", async (IHttpClientFactory factory, CancellationToken ct) =>
{
    var prices = await factory.CreateClient("pricing").GetStringAsync("/pricing", ct);
    return Results.Ok(prices);
});
```

The same thing in a controller:

```csharp
[ApiController]
[Route("reports")]
public class ReportsController(IHttpClientFactory factory) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> Get(CancellationToken ct)
    {
        var prices = await factory.CreateClient("pricing").GetStringAsync("/pricing", ct);
        return Ok(prices);
    }
}
```

The pattern is always the same: take the token as a parameter, hand it to every async call that accepts one. EF Core works the same way, for example `ToListAsync(ct)`.

To see it work, I called `/report` with `curl --max-time 2`, so the client gives up after two seconds. The pricing service takes 10 seconds and logs when it starts, finishes, or is cancelled:

```
pricing: started
pricing: cancelled
```

The client left, the token fired in `/report`, `HttpClient` abandoned its request, and the pricing service's own request token fired too. The cancellation travelled down the whole chain. ASP.NET Core did not log an error for the cancelled requests.

## Cancellation is not a rollback

Two things catch people out.

**It is a request, not an undo.** The token only tells code to stop going further. If your endpoint already saved an order, sent an email or charged a card before the token fired, those things stay done. Design multi-step operations so that is safe: make them idempotent, wrap all-or-nothing work in a transaction, and decide on purpose which steps may be cancelled. A step that must finish, like recording a payment, should not be given the request's token.

**The chain can be broken.** Only code that observes the token reacts to it. The documentation is explicit: [cancelling a token "has no effect on the running task unless it has also been passed the cancellation token and is prepared to handle cancellation"](https://learn.microsoft.com/dotnet/api/system.threading.tasks.task.wait). Here is the same endpoint where the programmer accepted the token but forgot to use it:

```csharp
app.MapGet("/report-broken", async (IHttpClientFactory factory, CancellationToken ct) =>
{
    var prices = await factory.CreateClient("pricing").GetStringAsync("/pricing");
    return Results.Ok(prices);
});
```

Same two second `curl`. This time the log shows:

```
pricing: started
pricing: finished (nobody may be waiting for this)
```

The pricing service ran the full 10 seconds for a client that left after 2. Nothing is wrong with the framework here, the token just never reached the call.

CPU-bound loops are the other classic case, because nothing checks the token for you. Check it yourself:

```csharp
foreach (var row in rows)
{
    ct.ThrowIfCancellationRequested();
    Process(row);
}
```

## Adding your own timeout

Sometimes you want the request token and a limit of your own, for example "give the pricing service 3 seconds". Combine them with a linked token source:

```csharp
app.MapGet("/report-with-timeout", async (IHttpClientFactory factory, CancellationToken ct) =>
{
    using var timeout = CancellationTokenSource.CreateLinkedTokenSource(ct);
    timeout.CancelAfter(TimeSpan.FromSeconds(3));

    try
    {
        var prices = await factory.CreateClient("pricing").GetStringAsync("/pricing", timeout.Token);
        return Results.Ok(prices);
    }
    catch (OperationCanceledException) when (!ct.IsCancellationRequested)
    {
        // our 3 second limit fired, the client is still waiting
        return Results.StatusCode(StatusCodes.Status504GatewayTimeout);
    }
});
```

The linked token fires when either the request token or the timeout does. The `when (!ct.IsCancellationRequested)` filter tells the two cases apart. If the client left, the exception is left alone, because there is nobody to answer. If only the timeout fired, the client is still waiting, so we answer with a 504. Calling this endpoint returned `HTTP 504` after 3.0 seconds.

Dispose the source you create, and never dispose a token source that the caller owns. The documentation's guide to [combining tokens and timeouts](https://learn.microsoft.com/dotnet/standard/asynchronous-programming-patterns/coalesce-cancellation-tokens-from-timeouts) says the same.

ASP.NET Core also has [request timeouts middleware](https://learn.microsoft.com/aspnet/core/performance/timeouts). When a timeout there is hit, the token in `HttpContext.RequestAborted` is cancelled, so the same code keeps working.

## Rules of thumb

1. Make `CancellationToken ct` the last parameter of every async method that does I/O.
2. Pass it to every call that accepts one. A call without it is a hole in the chain.
3. Don't swallow `OperationCanceledException`. Let it bubble, or filter it with `when` like above.
4. Dispose the sources you create.
5. Remember it is not a rollback. Decide which steps can be abandoned and which must finish.

## Sources

- [Cancellation in managed threads](https://learn.microsoft.com/dotnet/standard/threading/cancellation-in-managed-threads), Microsoft Learn
- [`CancellationTokenSource.CancelAfter`](https://learn.microsoft.com/dotnet/api/system.threading.cancellationtokensource.cancelafter), Microsoft Learn
- [`Task.Delay`](https://learn.microsoft.com/dotnet/api/system.threading.tasks.task.delay), Microsoft Learn
- [Use HttpContext in ASP.NET Core: `RequestAborted`](https://learn.microsoft.com/aspnet/core/fundamentals/use-http-context#requestaborted), Microsoft Learn
- [Model binding in ASP.NET Core: `CancellationToken`](https://learn.microsoft.com/aspnet/core/mvc/models/model-binding#cancellationtoken), Microsoft Learn
- [Coalesce cancellation tokens from timeouts](https://learn.microsoft.com/dotnet/standard/asynchronous-programming-patterns/coalesce-cancellation-tokens-from-timeouts), Microsoft Learn
- [Request timeouts middleware](https://learn.microsoft.com/aspnet/core/performance/timeouts), Microsoft Learn
