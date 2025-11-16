## MILESTONE 2 PLAN: EchoMint

**Team:** Solo Developer
**Track:** [X] SHIP-A-TON [ ] IDEA-TON
**Date:** November 16, 2025

---

## 📍 WHERE WE ARE NOW

**What we built/validated this weekend:**
- Full-stack ink! v6 NFT smart contract deployed on Passet Hub (pallet-revive)
- React/Next.js frontend with real-time market data integration via Arkiv Network
- Complete minting pipeline: Market data fetch → Image display → IPFS upload → On-chain minting
- Wallet integration with LunoKit + Polkadot.js for contract interactions
- Dynamic NFT mood states based on real market sentiment (Bullish, Bearish, Volatile, etc.)

**What's working:**
- Contract successfully deployed at `0x7790cd497f1D21759F00B83407E16B908319B9FC` on Passet Hub
- Real-time price data fetching from Arkiv for SOL, DOT, BTC
- H160 address derivation for pallet-revive compatibility
- Complete minting flow with wallet signing prompts
- NFT metadata structure with OpenSea compatibility

**What still needs work:**
- AI image generation API stability (currently using placeholder images)
- Hyperbridge integration for cross-chain messaging (deferred to M2)
- NFT gallery view with minted token history
- Real-time NFT mood updates based on price changes
- Production deployment and hosting

**Blockers or hurdles we hit:**
- ink! v6 with pallet-revive uses H160 addresses instead of AccountId32 - resolved by deriving H160 from SS58
- Gas limit estimation - resolved by using reasonable WeightV2 values
- LunoKit signer incompatibility with Polkadot.js API - resolved by accessing extension signer directly
- Gemini AI image generation rate limits - temporarily using sample images for display

---

## 🚀 WHAT WE'LL SHIP IN 30 DAYS

**Our MVP will do this:**
EchoMint will be a production-ready platform where users can mint dynamic NFTs that reflect real-time cryptocurrency market sentiment. The NFTs will update their visual appearance automatically based on cross-chain market data delivered via Hyperbridge, creating living digital art that responds to market conditions.

### Features We'll Build (5 max)

**Week 1-2: Hyperbridge Cross-Chain Integration**
- Feature: Integrate Hyperbridge for cross-chain message passing between Arkiv (data source) and Passet Hub (NFT contract)
- Why it matters: Enables trustless, decentralized data delivery without relying on centralized APIs
- Technical scope:
  - Set up Hyperbridge relayer configuration
  - Implement cross-chain message handlers in contract
  - Create dispatcher for periodic price updates
  - Test message verification and delivery

**Week 2-3: Dynamic NFT Updates**
- Feature: Implement on-chain NFT mood state updates triggered by Hyperbridge messages
- Why it matters: Makes NFTs truly "living" - they evolve based on real market conditions
- Technical scope:
  - Add `updateMood()` function to smart contract
  - Implement mood calculation logic on-chain
  - Create event emissions for mood changes
  - Build frontend subscription to mood change events

**Week 3-4: NFT Gallery & Portfolio View**
- Feature: Complete gallery page showing all minted NFTs with filtering and sorting
- Why it matters: Users need to see their NFT collection and track how moods change over time
- Technical scope:
  - Query all tokens owned by address
  - Display NFT cards with current mood state
  - Show historical mood transitions
  - Add filters by coin type and mood state
  - Implement mood change timeline visualization

**Week 3-4: Production AI Image Generation**
- Feature: Stable, production-ready AI image generation pipeline with fallbacks
- Why it matters: High-quality, unique NFT artwork is essential for user engagement
- Technical scope:
  - Implement multiple AI provider fallbacks (Gemini, DALL-E, Stable Diffusion)
  - Add image caching and optimization
  - Create queue system for batch generation
  - Implement retry logic with exponential backoff

**Week 4: Production Deployment & Testing**
- Feature: Deploy to production with monitoring, analytics, and comprehensive testing
- Why it matters: Ensures reliability and provides insights for iteration
- Technical scope:
  - Deploy frontend to Vercel/Netlify
  - Set up contract on Kusama or production Polkadot parachain
  - Implement error tracking (Sentry)
  - Add analytics (Mixpanel/Amplitude)
  - Comprehensive end-to-end testing
  - Performance optimization and caching

### Team Breakdown

**Solo Developer - Full-Stack** | 20-25 hrs/week
- Owns: All development, deployment, and testing
- Focus areas: Smart contracts, Hyperbridge integration, frontend, DevOps

### Mentoring & Expertise We Need

**Areas where we need support:**
- Hyperbridge setup and best practices for cross-chain messaging
- pallet-revive optimization and gas estimation strategies
- Production smart contract security audit
- Polkadot/Kusama parachain deployment guidance

**Specific expertise we're looking for:**
- Hyperbridge core team guidance on message passing patterns
- ink! contract optimization techniques for pallet-revive
- Polkadot ecosystem developer relations for go-to-market strategy
- NFT metadata standards and cross-platform compatibility

---

## 🎯 WHAT HAPPENS AFTER

**When M2 is done, we plan to...**
- Launch public beta on Kusama with limited token supply (1000 NFTs)
- Onboard early adopters and NFT collectors from Polkadot ecosystem
- Apply for Polkadot Treasury funding for continued development
- Build partnerships with DeFi protocols and market data providers
- Expand to support more cryptocurrencies (top 20 by market cap)
- Implement NFT trading marketplace with mood-based rarity system

**And 6 months out we see our project achieve:**
- 10,000+ minted NFTs across multiple chains (Kusama, Polkadot, Asset Hub)
- Integration with major Polkadot DeFi protocols for portfolio-based NFTs
- Multi-chain deployment via Hyperbridge (Ethereum, Avalanche, Cosmos)
- Revenue generation through minting fees and marketplace commissions
- Community DAO governance for adding new assets and mood parameters
- Recognition as the premier "living NFT" platform in Web3

**Monetization Strategy:**
- Minting fees: 0.1 DOT/KSM per NFT
- Marketplace trading fees: 2.5% on secondary sales
- Premium features: Custom mood algorithms, private collections
- Enterprise API: Market sentiment data access for institutions
- Partnerships: Revenue share with data providers (Arkiv, etc.)

**Key Metrics to Track:**
- Total NFTs minted
- Daily active users
- Transaction volume
- Mood state transitions per day
- Cross-chain message success rate
- User retention and engagement
- Revenue and treasury growth
