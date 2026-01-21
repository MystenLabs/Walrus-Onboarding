# Walrus Sites: Decentralized Websites

Host entire websites on Walrus with censorship resistance and high availability.

---

## What are Walrus Sites?

**Walrus Sites** = Static websites stored entirely on Walrus, served via a special portal.

**Key characteristics**:
- Website assets (HTML, CSS, JS, images) stored as blobs/quilts
- Site configuration stored on Sui
- Accessed via `.wal.app` domains or custom portals
- No traditional web servers
- Censorship resistant
- Verifiable content

**Example**: `https://my-project.wal.app`

**💬 Discussion**: What types of websites work well as Walrus Sites?

---

## How Walrus Sites Work

### Architecture

```
User Browser
    ↓
Walrus Site Portal (wal.app)
    ↓
Sui (site configuration)
    ↓
Walrus (HTML, CSS, JS, images)
```

**Components**:

1. **Site Object** (on Sui):
   ```move
   struct Site {
       id: UID,
       name: String,
       // Dynamic fields map paths to blob IDs
   }
   ```

2. **Dynamic fields** map paths to blob IDs:
   ```
   /index.html → blob_id_1
   /style.css  → blob_id_2
   /app.js     → blob_id_3
   /logo.png   → blob_id_4
   ```

3. **Portal** resolves requests:
   - User visits `my-site.wal.app`
   - Portal queries Sui for site object
   - Portal fetches blobs from Walrus
   - Portal serves content to browser

---

## Site Builder Tool

### Installation

The Walrus site builder is built with Rust and can be installed from source:

```bash
# Clone the repository
git clone https://github.com/MystenLabs/walrus-sites.git
cd walrus-sites

# Build the site builder CLI
cargo build --release
```

For detailed installation instructions, see the [official installation guide](https://docs.wal.app/docs/walrus-sites/tutorial-install).

### Basic Usage

```bash
# Build your static site (e.g., with React, Vue, etc.)
npm run build  # Creates ./dist or ./build

# Deploy to Walrus
site-builder deploy ./dist
```

**Output**:
```
Uploaded index.html (blob ID: 057MX9P...)
Uploaded style.css (blob ID: 1aF3kL...)
Uploaded app.js (blob ID: 9Bn2Xq...)
Site deployed: https://abc123.wal.app
Site Object ID: 0x...
```

### ✅ Checkpoint: Understand the Flow

Trace what happens when you visit `https://my-site.wal.app/about.html`:
1. Browser requests URL from portal
2. Portal does what?
3. Where does portal find the blob ID?
4. How does portal get the content?
5. What does portal return to browser?

**Instructor**: Walk through each step on whiteboard.

---

## Deployment Patterns

### Pattern 1: Simple Static Site

**Use case**: Documentation, portfolio, blog

**Structure**:
```
my-site/
├── index.html
├── about.html
├── style.css
└── logo.png
```

**Deployment**:
```bash
site-builder deploy my-site --epochs 26
```

**Costs**:
- 4 files, ~50 KB total
- Using quilt: ~7 storage units
- Annual cost: ~91,000 WAL

**Best for**: Small sites with few assets

### Pattern 2: Single Page Application (SPA)

**Use case**: React/Vue/Svelte app

**Structure**:
```
dist/
├── index.html
├── assets/
│   ├── main-abc123.js (1.2 MB)
│   ├── vendor-def456.js (800 KB)
│   └── styles-ghi789.css (100 KB)
└── images/
    ├── hero.jpg (500 KB)
    └── logo.svg (5 KB)
```

**Deployment strategy**:
```bash
# Build with cache busting (creates unique filenames)
npm run build

# Deploy
site-builder deploy dist --epochs 26
```

**Key consideration**: Large JS bundles increase costs

**Optimization**:
- Code splitting
- Tree shaking
- Compression
- Lazy loading

### Pattern 3: Content-Heavy Site

**Use case**: Photo gallery, media site

**Challenge**: Many large images

**Strategy**:
```bash
# Upload large images first
walrus store images/high-res-1.jpg --epochs 52
walrus store images/high-res-2.jpg --epochs 52

# Reference blob IDs in HTML
# <img src="https://aggregator.walrus.space/v1/057MX9P..." />

# Deploy site with referenced IDs
site-builder deploy site --epochs 26
```

**Why**: Extend image epochs independently of site updates

### ✅ Checkpoint: Choose Pattern

For each scenario, which pattern fits best?
1. Personal portfolio with 3 pages
2. React app with 2MB of JS
3. Photography showcase with 100 high-res images

**💬 Pair Discussion**: Justify your choices.

---

## Site Updates

### Updating Content

**Update process**:
```bash
# Make changes to your site
vim index.html

# Rebuild if needed
npm run build

# Deploy update
site-builder deploy dist --epochs 26
```

**What happens**:
- New blobs created for changed files
- Unchanged files reuse existing blobs
- New site object created on Sui
- Old blob IDs still valid (old versions accessible)

**Immutability**: Old site versions remain available via old site object IDs.

### Versioning Strategy

**Option 1**: Update site object in place
- Portal serves latest version
- Old versions accessible via object history

**Option 2**: New site object for each version
- Explicit versioning
- Can maintain multiple versions
- Useful for A/B testing

**💬 Discussion**: How would you handle staging vs production deployments?

---

## Cost Analysis

### Example: Documentation Site

**Assets**:
- 20 HTML pages (total 200 KB)
- 5 CSS files (total 50 KB)
- 10 images (total 2 MB)
- 3 JS files (total 300 KB)

**Using quilts for small files**:
- HTML + CSS in quilts: ~66 storage units
- Images as individual blobs: ~50 storage units
- Total: ~116 storage units

**Annual cost**:
- 116 × 500 WAL × 26 epochs = ~1,508,000 WAL
- At ~$0.0059/GB/year ≈ $0.02/year

**Comparison to traditional hosting**:
- Shared hosting: $5-10/month = $60-120/year
- **Walrus Sites: $0.02/year** (3000x cheaper!)

### Example: SPA with Heavy Assets

**Assets**:
- 1 HTML file (10 KB)
- Main JS bundle (2 MB)
- Vendor JS bundle (3 MB)
- CSS (200 KB)
- Images (5 MB)

**Cost calculation**:
- Total ~10.2 MB encoded ≈ 51 MB
- ~52 storage units
- Annual cost: 52 × 500 × 26 = 676,000 WAL ≈ $0.01/year

**Trade-off**: Site loads from Walrus, which may be slower than CDN

---

## Production Examples

### Example 1: Project Documentation

**Site**: Walrus protocol documentation
**Pattern**: Static site generator (MkDocs/Docusaurus)
**Strategy**:
- Deploy on each release
- Use quilts for markdown pages
- Individual blobs for images
- 26-epoch storage (1 year)

**Lesson**: Works well for content that updates infrequently

### Example 2: NFT Marketplace Frontend

**Site**: Decentralized marketplace UI
**Pattern**: React SPA
**Strategy**:
- Build optimized production bundle
- Deploy frontend to Walrus
- Backend APIs on traditional infrastructure
- Frontend updates independently

**Lesson**: Hybrid approach - static frontend on Walrus, dynamic backend elsewhere

### Example 3: DAO Governance Portal

**Site**: Voting interface
**Pattern**: Vue.js SPA
**Strategy**:
- Immutable frontend versions
- Each governance period gets new deployment
- Historical versions remain accessible
- Transparent and verifiable

**Lesson**: Immutability = auditability

**💬 Discussion**: What other use cases would benefit from censorship-resistant frontends?

---

## Best Practices

### 1. Optimize Bundle Size

```bash
# Analyze bundle
npm run build -- --analyze

# Key optimizations:
# - Code splitting
# - Tree shaking
# - Minification
# - Compression
```

**Why**: Smaller bundles = lower cost + faster loads

### 2. Use Appropriate Epochs

```javascript
// Different epochs for different assets
{
  "site_structure": 4,    // Update quarterly
  "blog_posts": 52,       // Keep for 2 years
  "images": 52            // Keep for 2 years
}
```

### 3. Implement Caching

```html
<!-- Cache-friendly asset names -->
<link rel="stylesheet" href="style-v1.2.3.css">
<script src="app-abc123.js"></script>
```

**Benefit**: Browsers cache assets, blob IDs don't change

### 4. Test Locally First

```bash
# Run local server to test
python -m http.server -d ./dist 8000
```

### 5. Monitor Storage Extensions

```bash
# Check epochs remaining
walrus info <blob-id>

# Extend before expiration
walrus extend <blob-id> --additional-epochs 26
```

**Automation**: Set up cron job or monitoring alert

---

## Try It Yourself: Deploy a Site

**Exercise** (20 min):

1. Create a simple HTML site:
   ```html
   <!-- index.html -->
   <!DOCTYPE html>
   <html>
   <head>
       <title>My Walrus Site</title>
   </head>
   <body>
       <h1>Hello from Walrus!</h1>
       <p>This site is decentralized.</p>
   </body>
   </html>
   ```

2. Deploy it:
   ```bash
   site-builder deploy . --epochs 1
   ```

3. Visit your site at the provided URL

### ✅ Checkpoint: Site Deployed

**Share with class**:
- Your site URL
- What blob IDs were created?
- What's the site object ID?
- Can you visit the site?

**Instructor**: Show 2-3 student sites as examples.

---

## Limitations and Considerations

### Current Limitations

**Performance**:
- Slower than traditional CDNs
- Blob fetch latency varies
- No edge caching (yet)

**Functionality**:
- No server-side code
- Need external APIs for dynamic features
- Limited to ~50 MB practical site size

**Usability**:
- Requires wallet for deployment
- Site updates cost gas + storage
- Domain system still evolving

### When to Use Walrus Sites

**Good fit**:
- ✅ Documentation
- ✅ Landing pages
- ✅ Blogs
- ✅ Portfolios
- ✅ DAO interfaces
- ✅ Censorship-sensitive content

**Poor fit**:
- ❌ E-commerce (needs server-side)
- ❌ Real-time apps (chat, gaming)
- ❌ Sites requiring sub-second loads
- ❌ Very large sites (>100 MB)

**💬 Discussion**: How might limitations change as Walrus evolves?

---

## Key Takeaways

- Walrus Sites = static websites on decentralized storage
- Rust-based site builder CLI handles deployment
- Dynamic fields on the Site object map paths to blob IDs (not a routes vector)
- Optimize bundle sizes to reduce costs
- Use quilts for small files, individual blobs for large assets
- Plan epochs based on update frequency
- Best for censorship-resistant, verifiable frontends
- Still evolving (expect improvements in performance and features)

**Next**: [Multi-Part Datasets](./03-multi-part-datasets.md) - Handling large, structured data
