# Cost Reduction Ideas

This section provides practical strategies to minimize storage costs in Walrus. Apply these techniques to optimize your storage spending.

## Reusing Storage Resources

One of the most effective cost reduction strategies is **reusing storage resources** by deleting deletable blobs before they expire.

### How It Works

When you delete a deletable blob before its expiration:

- The storage resource is reclaimed
- Remaining epochs can be reused for new blobs
- You only pay for the epochs you actually use

### Example

1. Store a blob for 10 epochs (costs 10 epochs of storage)
2. Use it for 5 epochs
3. Delete it early (reclaims 5 epochs of storage)
4. Store a new blob using the reclaimed 5 epochs (no additional storage resource cost)

**Savings**: You effectively only paid for 5 epochs instead of 10.

### Best Practices

- **Use deletable blobs**: Only deletable blobs can be deleted early
- **Delete when done**: Actively delete blobs as soon as they're no longer needed
- **Match sizes**: Storage resources must match in size to be reused
- **Monitor expiration**: Track blob expiration dates to maximize reuse

### Limitations

- Only works with deletable blobs (not permanent blobs)
- Storage resources must match in size
- Requires active management
- Storage resources must have remaining epochs

## Batch Operations

Batching multiple operations reduces transaction costs and can improve efficiency.

### Batch Uploads

Upload multiple blobs in a single command:

```sh
walrus store file1.txt file2.txt file3.txt --epochs 10
```

**Benefits**:
- Reduces number of transactions
- Lower total SUI gas costs
- Can reuse storage resources across blobs
- Faster overall operation

### Batch Certifications

When storing multiple blobs, certifications are automatically batched in the same transaction, reducing costs.

### Programmable Transaction Blocks (PTBs)

For advanced use cases, you can combine multiple operations in a single PTB:

- Acquire storage resources
- Register multiple blobs
- Certify multiple blobs
- Split/merge storage resources

This minimizes transaction costs and latency.

## Quilt Storage for Small Blobs

[Quilt storage](https://github.com/MystenLabs/walrus/blob/main/docs/book/usage/quilt.md) is specifically designed to reduce costs for small blobs by amortizing metadata costs across multiple blobs.

### When to Use Quilt

- **Small blobs (< 10MB)**: Where metadata overhead dominates costs
- **Multiple small files**: When storing many small files together
- **Batch operations**: When you can group small blobs

### Cost Benefits

- **Reduced metadata overhead**: Metadata costs shared across batch
- **Lower transaction costs**: Fewer transactions per blob
- **Lower object costs**: Fewer Sui objects created

### Example Savings

Storing 100 small files (1MB each) individually:

- Each file: ~64MB encoded size (metadata dominated)
- Total: 6,400MB encoded size

Storing same files in Quilt:

- Batch metadata: Shared across all files
- Total: Much less than 6,400MB encoded size

**Savings**: Significant reduction in storage and upload costs.

## Optimizing Blob Sizes

### Compression

Compress data before storing to reduce blob size:

- **Text files**: Use gzip, bzip2, or similar
- **Images**: Use appropriate image compression
- **Databases**: Use database-specific compression

**Trade-off**: Compression reduces storage costs but increases CPU usage for compression/decompression.

### Chunking Large Files

For very large files, consider:

- **Split into chunks**: Store as multiple smaller blobs
- **Benefits**: Can retrieve parts independently, parallel downloads
- **Considerations**: Adds complexity, may increase total cost due to metadata overhead

### Avoiding Unnecessary Data

- **Remove redundant data**: Don't store duplicate information
- **Clean before storing**: Remove temporary or unnecessary data
- **Store only what's needed**: Avoid storing data you won't use

## Storage Resource Management

### Buy Larger Resources

Buying larger storage resources can be more cost-effective:

- **Lower per-unit cost**: Sometimes better rates for larger purchases
- **Fewer transactions**: One large purchase vs. many small ones
- **Split later**: Can split large resources into smaller ones as needed

### Split and Merge Strategically

- **Split large resources**: Break down into needed sizes
- **Merge small resources**: Combine when possible
- **Use PTBs**: Combine split/merge with blob operations to reduce transaction costs

### Transfer and Trade

Storage resources can be transferred and traded:

- **Receive from others**: Get resources from partners or suppliers
- **Transfer between projects**: Move resources as needed
- **Future markets**: May be able to buy/sell resources on secondary markets

## Transaction Cost Optimization

### Combine Operations

Use Programmable Transaction Blocks to combine:

- Storage resource acquisition
- Blob registration
- Blob certification
- Resource splitting/merging

### Reduce Transaction Frequency

- **Batch operations**: Group multiple operations together
- **Plan ahead**: Acquire resources in advance
- **Extend in bulk**: Extend multiple blobs together

### Optimize Gas Usage

- **Use efficient operations**: Choose operations that minimize gas
- **Avoid unnecessary calls**: Don't make redundant transactions
- **Monitor gas prices**: Execute transactions when gas prices are lower

## Object Cost Management

### Burn Unused Objects

If you don't need blob lifecycle management, burn blob objects early:

```sh
walrus burn-blobs --object-ids <BLOB_OBJECT_ID>
```

**Benefits**:

- Reclaims SUI storage fund deposit
- Reduces ongoing SUI costs
- Doesn't delete the blob on Walrus

**Considerations**:

- Can't extend blob lifetime after burning
- Can't delete blob to reclaim storage resource
- Can't add attributes after burning

### When to Burn

Burn objects when:

- Blob lifetime is fixed and won't need extension
- You don't need to delete the blob early
- You don't need to add attributes
- SUI costs are significant relative to WAL costs

### When Not to Burn

Keep objects when:

- You might need to extend blob lifetime
- You want to delete blob early to reuse storage
- You need blob lifecycle management features
- Object costs are minimal

## Storage Duration Optimization

### Use Appropriate Duration

- **Don't over-provision**: Only pay for epochs you need
- **Start short, extend later**: Begin with shorter duration, extend if needed
- **Delete early**: Use longer duration with deletable blobs, delete when done

### Extend Strategically

- **Extend in bulk**: Extend multiple blobs together
- **Extend before expiration**: Avoid last-minute extensions
- **Consider permanent blobs**: For truly permanent data

## Monitoring and Optimization

### Track Costs

Regularly monitor your costs:

- **Per blob**: Track cost per blob stored
- **Per operation**: Track cost per operation type
- **Over time**: Track cost trends

### Identify Optimization Opportunities

Look for:

- **Unused blobs**: Delete blobs that are no longer needed
- **Over-provisioned storage**: Reduce storage duration where possible
- **Inefficient operations**: Optimize transaction patterns
- **Small blob opportunities**: Use Quilt for small blobs

### Regular Reviews

- **Monthly reviews**: Check for optimization opportunities
- **Quarterly optimization**: Major cost reduction initiatives
- **Annual planning**: Long-term optimization strategies

## Cost Reduction Checklist

Use this checklist to optimize your storage costs:

- [ ] Use deletable blobs and delete them early when done
- [ ] Batch multiple uploads together
- [ ] Use Quilt storage for small blobs (< 10MB)
- [ ] Compress data before storing when appropriate
- [ ] Buy larger storage resources and split as needed
- [ ] Combine operations in PTBs to reduce transaction costs
- [ ] Burn blob objects when lifecycle management isn't needed
- [ ] Use appropriate storage duration (don't over-provision)
- [ ] Monitor costs regularly and identify optimization opportunities
- [ ] Delete unused blobs to reclaim storage resources

## Next Steps

Now that you understand cost reduction strategies, explore [Real-World Scenarios](./scenarios.md) to see how these strategies apply to common use cases.

