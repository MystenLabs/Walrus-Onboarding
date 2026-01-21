# 5. When Not to Use Relay

While the upload relay simplifies many use cases, there are scenarios where direct node communication
is preferable or necessary. The
[operator guide](https://docs.wal.app/operator-guide/upload-relay.html#overview) frames the relay as a solution for
browsers and other low-powered clients. If you're running well-provisioned infrastructure, it's
usually better to keep uploads in your own process so you can fine-tune performance, monitoring, and
cost controls.

## Server-Side Applications

### Backend Services

For server-side applications, direct node communication offers:

- **Full Control**: Complete control over the upload process
- **Custom Logic**: Ability to implement custom retry and error handling
- **Monitoring**: Direct visibility into node health and performance
- **Cost Control**: No relay tip costs (relays can require tips per the
  [operator guide](https://docs.wal.app/operator-guide/upload-relay.html#upload-relay-operation))

Example use case: A backend service that processes and uploads large datasets.

> The CLI guide explicitly notes that upload relays help clients with limited bandwidth or browser
> networking constraints ([usage guide](https://docs.wal.app/usage/client-cli.html#using-a-walrus-upload-relay)).
> When those constraints don't apply—as with typical backend services—you can stick with the direct
> node path.

### Batch Processing

Server-side batch processing benefits from direct control:

- **Custom Batching**: Implement your own batching strategy
- **Priority Management**: Control upload priorities
- **Resource Management**: Better control over server resources

Example use case: A data pipeline that uploads processed data to Walrus.

## Direct Control Requirements

### Custom Retry Logic

When you need specific retry behavior:

- **Exponential Backoff**: Custom backoff strategies
- **Selective Retries**: Retry only specific types of errors
- **Rate Limiting**: Custom rate limiting logic

Example use case: An application that needs to retry only network errors, not validation errors.

### Monitoring and Observability

Direct communication provides:

- **Node-Level Metrics**: Track performance per node
- **Detailed Logging**: Log interactions with each node
- **Health Checks**: Monitor individual node health
- **Custom Alerts**: Alert on specific node failures

Example use case: A service that needs detailed metrics for each storage node.

## Cost Considerations

### Avoiding Relay Tips

Relays may charge tips for their service:

- **Direct Uploads**: No tip costs when uploading directly
- **Volume Discounts**: Direct uploads may be more cost-effective at scale
- **Predictable Costs**: Direct costs are more predictable

Example use case: A high-volume service where relay tips would be significant.

### Resource Optimization

Server-side applications can optimize:

- **Connection Pooling**: Reuse connections to storage nodes
- **Parallel Uploads**: Optimize parallel upload strategies
- **Bandwidth Management**: Control bandwidth usage

Example use case: A service that needs to optimize network resource usage.

## Custom Error Handling

### Specific Error Requirements

When you need to handle errors in specific ways:

- **Partial Success Handling**: Handle partial uploads differently
- **Node-Specific Logic**: Different logic for different nodes
- **Graceful Degradation**: Custom degradation strategies
- **Error Classification**: Classify errors for different handling

Example use case: An application that needs to handle node failures with custom recovery logic.

## Configuration Without Relay

To use direct node communication, simply don't configure the relay:

```typescript
import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';
import { walrus } from '@mysten/walrus/client';

const client = new SuiClient({
  url: getFullnodeUrl('testnet'),
  network: 'testnet',
}).$extend(
  walrus({
    // No uploadRelay configuration
    storageNodeClientOptions: {
      timeout: 60_000,
    },
  }),
);
```

## Key Indicators for Not Using Relay

Don't use the relay when:

- ❌ Your application runs on a server (not client-side)
- ❌ You need custom retry or error handling logic
- ❌ You require detailed monitoring of individual nodes
- ❌ Cost optimization is critical (avoiding relay tips)
- ❌ You need to implement specific upload strategies
- ❌ You're building infrastructure or backend services

## Key Takeaways

- Don't use the relay for server-side applications
- Use direct communication when you need custom retry logic
- Avoid relay when cost optimization is important
- Direct communication provides better observability
- Choose based on your specific requirements and constraints

## Next Lecture

Continue with [Basic Upload Example](./06-basic-upload-example.md) to walk through a full implementation
that applies these direct-upload concepts in code.
