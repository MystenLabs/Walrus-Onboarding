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

## Grouping Small Blobs for Cost Efficiency

> 💡 **Walrus Quilt - Official Batch Storage:** Walrus provides **Quilt** as the native batch storage tool for grouping small blobs. Quilt can reduce costs by **up to 409x** for 10KB files (storing 600 files as a single quilt vs. individual blobs).

📖 **Learn more:** [Quilt documentation](https://github.com/MystenLabs/walrus/blob/main/docs/book/usage/quilt.md) - implementation details and full cost savings table

When storing multiple small blobs, grouping them together into a single storage unit can
dramatically reduce costs by amortizing metadata overhead and transaction fees across the batch.
This technique is especially powerful for small blobs where fixed overhead costs dominate.

### Basic Concept of Grouping

Grouping multiple small blobs together shares the fixed metadata overhead (~61-64MB per blob) across all blobs in the group. This is particularly cost-effective for small blobs where metadata dominates the encoded size. **[Walrus Quilt](https://github.com/MystenLabs/walrus/blob/main/docs/book/usage/quilt.md)** implements this pattern natively, allowing up to 666 blobs per quilt (QuiltV1).

### When Grouping Makes Sense

Grouping is most effective when:

- **Small blobs (< 10MB)**: Where metadata overhead dominates costs (~64MB per blob)
- **Many small files**: Storing large numbers of small files together (hundreds of files)
- **Similar lifetimes**: Files that need to be stored for the same duration
- **Collections or batches**: Related files that are typically managed together (e.g., NFT image
  collections, log files, document batches)

### Cost Reduction Benefits

- **Reduced metadata overhead**: Fixed metadata costs (~64MB) can be shared across multiple blobs in a batch
- **Lower per-blob storage cost**: Instead of paying ~64MB metadata per blob, multiple blobs share metadata
- **Lower transaction costs**: Fewer transactions when storing multiple blobs together
- **Lower object costs**: Potentially fewer Sui objects created depending on implementation

### Example Cost Savings

Storing 100 small files (1MB each) individually:
- Each file: ~64MB encoded size (metadata dominated)
- Total: 6,400MB encoded size

Storing same files grouped together:
- Shared metadata: One ~64MB metadata overhead instead of 100 × 64MB
- Data overhead: Remaining cost is primarily data encoding (~5x original size)
- Total: Significantly less than 6,400MB encoded size if we calculated simply.

### Key Principles for Grouping-Based Cost Reduction

1. **Group Similar Sizes**: Blobs of similar sizes can be more efficiently grouped together
2. **Group by Lifetime**: Group blobs that need the same storage duration for better resource management
3. **Balance Batch Size**: Larger batches (up to hundreds of files) amortize metadata better,
   maximizing cost savings
4. **Consider Access Patterns**: Group files that are typically accessed together for operational efficiency

### Trade-offs and Limitations

While grouping provides significant cost savings, consider these trade-offs:

**Limitations:**

- **Individual operations**: Operations like delete, extend, or share must be applied to the entire
  batch, not individual blobs
- **ID system**: Blobs in a batch use a different ID system than regular blobs (batch-specific IDs
  rather than content-derived IDs)
- **Batch size limits**: There are practical limits on how many blobs can be grouped (typically
  hundreds)

**When NOT to use grouping:**

- Files that need individual lifecycle management (different expiration dates, individual deletion)
- Files that need to be shared or extended independently
- Very large files (> 10MB) where overhead is less significant
- Files where content-derived IDs are required

### Best Practices

- **Batch small files together**: Group files under 10MB, especially those under 100KB
- **Use for collections**: Perfect for NFT images, log files, document batches, or any related
  small files
- **Plan batch composition**: Group files that will be managed together throughout their lifetime
- **Leverage metadata**: Use identifiers and tags for efficient lookup within batches

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
- **Small blob opportunities**: Group small blobs together to amortize metadata costs

### Regular Reviews

- **Monthly reviews**: Check for optimization opportunities
- **Quarterly optimization**: Major cost reduction initiatives
- **Annual planning**: Long-term optimization strategies

## Cost Reduction Checklist

Use this checklist to optimize your storage costs:

- [ ] Use deletable blobs and delete them early when done
- [ ] Batch multiple uploads together
- [ ] Group small blobs together (batch storage) to reduce metadata overhead and transaction costs
- [ ] Compress data before storing when appropriate
- [ ] Buy larger storage resources and split as needed
- [ ] Combine operations in PTBs to reduce transaction costs
- [ ] Burn blob objects when lifecycle management isn't needed
- [ ] Use appropriate storage duration (don't over-provision)
- [ ] Monitor costs regularly and identify optimization opportunities
- [ ] Delete unused blobs to reclaim storage resources

## Key Takeaways

- **Resource reuse is most powerful**: Delete deletable blobs early to reclaim and reuse remaining epochs
- **Quilt for small blobs**: [Walrus Quilt](https://github.com/MystenLabs/walrus/blob/main/docs/book/usage/quilt.md) can reduce costs up to 409x for small files by sharing metadata overhead
- **Batch operations save SUI**: Combine multiple operations in PTBs to reduce transaction costs
- **Burn objects when lifecycle management isn't needed**: Reclaim SUI deposits by burning blob objects
- **Trade-offs exist**: Grouping loses individual control, burning removes lifecycle management

## Next Steps

Now that you understand cost reduction strategies, explore [Real-World Scenarios](./05-scenarios.md) to see how these strategies apply to common use cases.
