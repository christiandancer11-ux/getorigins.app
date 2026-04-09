import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const SPORTS_CARDS_INFO = {
  baseball: { name: 'Baseball', icon: '⚾', desc: 'Learn about rookie cards, grading, and market trends in baseball card collecting.' },
  basketball: { name: 'Basketball', icon: '🏀', desc: 'Master NBA card values, modern vs vintage, and spotting valuable parallels.' },
  football: { name: 'Football', icon: '🏈', desc: 'Understand NFL card rarities, autograph values, and set variations.' },
  hockey: { name: 'Hockey', icon: '🏒', desc: 'Explore NHL card collecting, rookie sensations, and vintage market opportunities.' },
  soccer: { name: 'Soccer', icon: '⚽', desc: 'Discover international player cards and emerging market trends.' },
  golf: { name: 'Golf', icon: '⛳', desc: 'Learn about golf card rarity and collector demand.' },
  ufc: { name: 'UFC', icon: '🥊', desc: 'Understand MMA fighter card values and market dynamics.' },
  wwe: { name: 'WWE', icon: '🎭', desc: 'Explore wrestling card collectibles and signature variants.' }
};

const TCG_INFO = {
  pokemon: { name: 'Pokémon', icon: '🔴', desc: 'Master base set values, holographics, and modern set collecting.' },
  magic_the_gathering: { name: 'Magic: The Gathering', icon: '✨', desc: 'Learn about card rarity, power level, and vintage market trends.' },
  yugioh: { name: 'Yu-Gi-Oh!', icon: '⚡', desc: 'Understand deck viability, secret rares, and competitive card values.' },
  one_piece: { name: 'One Piece', icon: '🏴‍☠️', desc: 'Explore emerging TCG market and collector demand.' },
  lorcana: { name: 'Disney Lorcana', icon: '👑', desc: 'Learn about new set releases and character rarity tiers.' }
};

const COLLECTOR_LESSONS = (category, cardTypes) => [
  {
    lesson_number: 1,
    title: 'What Are ${category}?',
    description: 'Understand the basics of ${category.toLowerCase()} and why collectors love them.',
    content: `# Lesson 1: What Are ${category}?

Welcome to card collecting! Let's start with the fundamentals.

## What Makes Cards Special?
${category} cards are physical assets that hold value through:
- Rarity and print runs
- Player/character popularity
- Set scarcity
- Condition and grading
- Historical significance

## Why People Collect
- **Personal Connection**: Support favorite players/characters
- **Investment**: Cards appreciate over time
- **Hobby Satisfaction**: Build complete sets
- **Community**: Connect with other enthusiasts

## The Thrill of the Hunt
Great collectors enjoy finding hidden gems at fair prices.`
  },
  {
    lesson_number: 2,
    title: 'Understanding Card Types & Products',
    description: 'Learn the different product formats and card types available.',
    content: `# Lesson 2: Understanding ${category} Types & Products

${category} comes in many forms. Let's break them down.

## Card Type Overview
${cardTypes.slice(0, 4).map(ct => `### ${ct.name} (${ct.icon})\n${ct.desc}`).join('\n\n')}

## Product Formats
- **Booster Packs**: Random cards per pack
- **Theme Decks/Sets**: Curated card selection
- **Tins/Special Boxes**: Premium packaging
- **Loose Cards**: Individual purchased cards
- **Graded Cards**: Authenticated and slabbed

## Set Releases
New sets release regularly with:
- Different rarities
- Chase cards and special editions
- Parallel variations
- Limited print runs`
  },
  {
    lesson_number: 3,
    title: 'Card Rarity & What to Look For',
    description: 'Master rarity tiers and how they impact value.',
    content: `# Lesson 3: Card Rarity & What to Look For

Rarity is the foundation of card value.

## Rarity Hierarchy
- **Common**: Abundant, lower value
- **Uncommon**: Less common, moderate appeal
- **Rare**: Sought after, meaningful value
- **Ultra Rare**: Scarce, high value
- **Legendary/Mythic**: Very rare, premium pricing
- **1 of 1/Chase**: One-of-a-kind, highest demand

## Print Runs Matter
Older cards = lower print runs = higher value.
Modern cards = higher print runs = more common.

## Recognizing Value
Not all rares are valuable. Look for:
- Popular players/characters
- Unique variations
- Low print numbers
- Strong demand signals`
  },
  {
    lesson_number: 4,
    title: 'Starting Your Collection Strategy',
    description: 'Create a focused collecting plan.',
    content: `# Lesson 4: Starting Your Collection Strategy

A good strategy saves money and builds value.

## Choose Your Focus
Collect:
- **Complete Sets**: All cards from a set
- **Player Collections**: All cards of one player
- **Era Specific**: Vintage, modern, or golden age
- **Grade Targeting**: High-grade PSA 9s and 10s
- **Budget Category**: Affordable, mid-range, or premium

## Set a Budget
- Determine monthly spending
- Balance quality over quantity
- Resist FOMO-driven impulses
- Buy strategically, not randomly

## Start Small
Buy 5-10 quality cards you genuinely want before scaling up.`
  },
  {
    lesson_number: 5,
    title: 'Where to Find & Buy Cards',
    description: 'Learn trusted sources for quality cards.',
    content: `# Lesson 5: Where to Find & Buy Cards

Knowing where to shop is critical.

## Online Platforms
- **eBay**: Largest selection, auction and fixed price
- **TCGPlayer/PWCC**: Specialized retailers
- **Heritage Auctions**: High-end vintage cards
- **Local Facebook Groups**: Community connections

## Local Sources
- **Card Shops**: Support local, build relationships
- **Card Shows & Conventions**: Find deals and rare inventory
- **Local Collectors**: Direct trading and buying

## Spotting Good Deals
- Compare prices across platforms
- Look for underpriced listings
- Build seller relationships for discounts
- Set alerts for your target cards`
  },
  {
    lesson_number: 6,
    title: 'Evaluating Condition & Authenticity',
    description: 'Learn to spot fakes and assess card condition.',
    content: `# Lesson 6: Evaluating Condition & Authenticity

Never overpay for condition or quality issues.

## Condition Red Flags
- Blurry or off-center printing
- Weak corners or edges
- Color inconsistencies
- Missing security features
- Unusual card weight

## Spotting Counterfeits
- Compare to known authentic examples
- Check for hologram or security features
- Inspect print quality closely
- Ask seller for detailed photos
- When in doubt, skip it

## Smart Buying
- Ask detailed questions
- Request high-resolution photos
- Buy from reputable sellers
- Use buyer protection when available`
  },
  {
    lesson_number: 7,
    title: 'Building Your Core Collection',
    description: 'Establish the foundation of your collection.',
    content: `# Lesson 7: Building Your Core Collection

Start with cards that bring you joy.

## Core Collection Principles
- Buy cards you genuinely like
- Focus on quality over quantity
- Build around a clear theme
- Document everything
- Track cost basis

## The First 20 Cards
Make your first purchases count:
- One iconic card from each type
- A mix of price points
- Cards with personal meaning
- Quality condition pieces

## Organization Matters
- Use binders or boxes
- Keep cards in sleeves
- Track locations
- Create a digital inventory
- Protect from damage`
  },
  {
    lesson_number: 8,
    title: 'Understanding Grading & When to Grade',
    description: 'Know when professional grading makes sense.',
    content: `# Lesson 8: Understanding Grading & When to Grade

Professional grading is an investment, use it wisely.

## Grading Companies
- **PSA**: Most popular for most cards
- **BGS**: Preferred for vintage
- **SGC**: Historical standard
- **CGC**: Newer but growing

## The Cost-Benefit
- Grading costs $25-150+ per card
- Only grade if value justifies cost
- Grade rule: Card value > grading cost × 2
- High-potential raw cards before hype

## Grading Scale
- 10: Gem Mint (flawless)
- 9: Mint (nearly perfect)
- 8: Near Mint (light wear)
- 7: Near Mint (more wear)

## When to Grade
- Cards worth $500+
- High-potential raw cards
- Vintage cards in excellent condition
- Cards you plan to sell soon`
  },
  {
    lesson_number: 9,
    title: 'Market Research & Price Tracking',
    description: 'Use data to make smart collecting decisions.',
    content: `# Lesson 9: Market Research & Price Tracking

Data drives smarter collecting decisions.

## Research Tools
- **eBay Sold Listings**: Real market prices
- **Market Comps**: Professional pricing
- **Trending Alerts**: Hot cards right now
- **Historical Prices**: See price trends

## What to Track
- Recent sale prices
- Price trends over time
- Supply and demand signals
- Seasonal patterns
- Player/character hot news

## Using Price Alerts
- Set alerts for target cards
- Wait for dips to buy
- Monitor sell-through rates
- Adjust based on trends

## Smart Collecting = Research First
Never buy without checking recent comps.`
  },
  {
    lesson_number: 10,
    title: 'Managing & Organizing Your Collection',
    description: 'Keep your collection secure and valuable.',
    content: `# Lesson 10: Managing & Organizing Your Collection

Good organization protects value and your investment.

## Documentation System
- Photograph each card
- Record purchase price and date
- Note condition details
- Keep receipts
- Create digital backup

## Storage Best Practices
- Use acid-free sleeves
- Store in cool, dry place
- Keep away from sunlight
- Use protective cases for expensive cards
- Separate high-value from bulk

## Insurance Considerations
- Document total collection value
- Take photos for insurance
- Keep appraisals for valuable cards
- Consider homeowner's insurance rider

## Regular Reviews
- Update prices quarterly
- Track unrealized gains
- Assess collection direction
- Celebrate milestones`
  },
  {
    lesson_number: 11,
    title: 'Advanced Card Types & Variations',
    description: 'Deep dive into rare variations and chase cards.',
    content: `# Lesson 11: Advanced ${category} Types & Variations

Every type has hidden gems worth knowing.

## Variations Exist Everywhere
- **Parallels**: Color variations, limited print runs
- **Short Prints**: Rare base set variations
- **First Editions**: Earlier release versions
- **Signed Cards**: Authentic autographs
- **Special Editions**: Error cards, unique printings

## Chase Cards
High-value cards found in products:
- **Hits**: Autographs, patches, rare cards
- **1 of 1s**: Single printed cards
- **Low Numbers**: Serial numbered cards

## Hidden Value
Great collectors know which variations matter.`
  },
  {
    lesson_number: 12,
    title: 'Seasonal Trends & Timing',
    description: 'Learn when to buy and what influences price cycles.',
    content: `# Lesson 12: Seasonal Trends & Timing

Patience and timing multiply collecting value.

## Seasonal Patterns
- **New Releases**: Initial hype then cooling
- **Holiday Seasonality**: Buying surges
- **Sports Season**: Player performance drives prices
- **Vintage Cycles**: Nostalgia waves

## What Drives Prices
- New set releases
- Major player achievements
- Sports playoff/championship runs
- Media appearances
- Pop culture moments

## Smart Timing
- Buy when hype cools
- Accumulate before news drops
- Avoid peak FOMO moments
- Patience wins long-term`
  },
  {
    lesson_number: 13,
    title: 'Building Relationships in the Community',
    description: 'Connect with other collectors and gain insider knowledge.',
    content: `# Lesson 13: Building Community Relationships

The best collectors aren't loners.

## Where to Find Community
- **Online Forums**: Deep discussions
- **Social Media Groups**: Real-time chat
- **Local Card Shops**: In-person connections
- **Card Shows**: Meet serious collectors
- **Discord Communities**: Tight-knit groups

## Benefits of Community
- Learn from experienced collectors
- Find trading partners
- Get insider tips
- Share successes
- Support each other

## Giving Back
- Share your knowledge
- Help newer collectors
- Make fair trades
- Be honest about condition
- Build reputation`
  },
  {
    lesson_number: 14,
    title: 'Long-Term Collection Goals',
    description: 'Create a vision for your collection future.',
    content: `# Lesson 14: Long-Term Collection Goals

Think decades, not days.

## Vision Setting
- Where do you want to be in 5 years?
- What will your collection look like?
- How much do you want to spend annually?
- What gives you collecting satisfaction?

## Goal Categories
- **Completion Goals**: Finish specific sets
- **Milestone Goals**: Reach collection values
- **Type Goals**: Master specific card types
- **Grade Goals**: Build all-9s or all-10s collection

## Milestone Tracking
- Celebrate progress
- Adjust goals as you learn
- Document the journey
- Share milestones with community

## Avoiding Burnout
- Collect at sustainable pace
- Balance spending with income
- Take breaks from hunting
- Remember why you collect`
  },
  {
    lesson_number: 15,
    title: 'Your Collecting Journey Begins',
    description: 'You\'re ready to start collecting strategically.',
    content: `# Lesson 15: Your Collecting Journey Begins

You now have the knowledge to collect smartly.

## Your Next Steps
1. Define your collection focus
2. Set a realistic budget
3. Research your first target cards
4. Make your first purchases
5. Document and organize
6. Connect with community
7. Track progress quarterly
8. Celebrate milestones

## Remember
- Quality over quantity
- Patience over impulse
- Strategy over emotion
- Community over isolation
- Joy over stress

## This is Just the Beginning
Keep learning, stay curious, and enjoy the hobby. The best collections are built with passion and patience.`
  }
];

const FLIPPER_LESSONS = (category, cardTypes) => [
  {
    lesson_number: 1,
    title: 'The Card Flipping Business Basics',
    description: 'Understand how profitable card flipping works.',
    content: `# Lesson 1: The Card Flipping Business Basics

Card flipping is buying low and selling high—quickly.

## What is Flipping?
- Buy underpriced cards
- Resell for profit within weeks/months
- Focus on cash flow over long-term holding
- High volume, reasonable margins

## Profit Margins
- Typical target: 20-50% profit per flip
- Account for all fees and costs
- Time to flip matters (faster = better)
- Volume compounds returns

## Risk vs Reward
- Faster profits = higher risk
- Wrong picks = inventory sitting
- Market moves quickly
- Skill matters more than luck`
  },
  {
    lesson_number: 2,
    title: 'Market Analysis for Flippers',
    description: 'Learn to spot profit opportunities in real-time.',
    content: `# Lesson 2: Market Analysis for Flippers

Flippers live on data and speed.

## Data Tools You Need
- **Price Tracking**: Monitor current prices
- **Sold Listings**: See what actually sold
- **Volume Data**: How fast cards move
- **Trending Alerts**: Spot hot cards early

## Market Inefficiencies
- Different prices on different platforms
- Mispriced high-value cards
- Condition quality discrepancies
- Information lag between platforms

## Speed = Profit
- Spot inefficiencies first
- Act within hours
- Move inventory quickly
- Reinvest profits

## Real-Time Monitoring
Use Origins tools to watch markets 24/7.`
  },
  {
    lesson_number: 3,
    title: 'Finding Underpriced Inventory',
    description: 'Techniques for sourcing flip-worthy cards.',
    content: `# Lesson 3: Finding Underpriced Inventory

Sourcing is the foundation of profitable flipping.

## Sourcing Strategies
- **Platform Arbitrage**: Buy low on one, sell high on another
- **Quick Sales**: Buy overstock clearance
- **Graded Premiums**: Buy raw, grade, sell graded
- **Emerging Trends**: Front-run market movements

## Where to Source
- **eBay**: Auctions, bulk lots, ending soon
- **Local Liquidation**: Buy collections
- **Card Shops**: Bulk deals
- **Facebook Groups**: Private sales at discounts

## Spotting Opportunities
- Price gaps between platforms
- Underpriced due to poor listing quality
- Condition assessed incorrectly
- Market mood shifts
- News creating temporary dips

## Due Diligence
Verify authenticity and condition before buying.`
  },
  {
    lesson_number: 4,
    title: 'Grading Strategy for Flippers',
    description: 'When and how to use grading to multiply profit.',
    content: `# Lesson 4: Grading Strategy for Flippers

Grading transforms raw cards into premium assets.

## The Grading Equation
- Buy raw at $50
- Grade for $25
- Sell graded at $150
- Profit: $75 (150%)

## When to Grade
- High-potential raw cards
- Cards on trending lists
- Quality pieces that grade 8+
- Before market peaks

## Grading Companies
- **PSA**: Most liquid, highest prices
- **BGS**: Vintage specialists
- **SGC**: Legacy collectors
- **CGC**: Emerging alternative

## Timing Matters
- Grade before hype peaks
- Submit before market cools
- Batch submissions save costs
- Track turnaround times

## Cost Management
- Bulk submissions lower per-card cost
- Standard service vs express
- Only grade cards that justify cost`
  },
  {
    lesson_number: 5,
    title: 'Recognizing Hot Cards & Trends',
    description: 'Develop intuition for cards about to spike.',
    content: `# Lesson 5: Recognizing Hot Cards & Trends

Early spotters make the biggest profits.

## Trend Indicators
- **Sports Performance**: Star rookies, award winners
- **Media Hype**: Movies, shows, news coverage
- **Set Releases**: New products hitting the market
- **Scarcity**: Low print runs emerging
- **Social Momentum**: Viral discussion growing

## Leading Indicators
- Content creator mentions
- Social media engagement rising
- Volume increases before price
- Sold listings accelerating
- Inventory tightening

## Your Edge
- Follow the community closely
- Set up trend alerts
- Track emerging stories
- Act faster than others

## Timing the Peak
- Get in early
- Take profits before peak
- Avoid the crash
- Move inventory before decline`
  },
  {
    lesson_number: 6,
    title: 'Pricing Strategy for Maximum Profit',
    description: 'Price your flips to sell fast and profitably.',
    content: `# Lesson 6: Pricing Strategy for Maximum Profit

Pricing is an art and science.

## Pricing Models
- **Competitive**: Match or beat others
- **Value-Based**: Price based on comps
- **Volume-Based**: Lower margins for faster turnover
- **Peak Pricing**: Higher during hot moments

## Profit Targets
- Calculate all costs first
- Set minimum acceptable margin
- Leave room for negotiation
- Build in buffer for fees

## Speed = Volume
- Price slightly below market
- Move inventory in weeks
- Reinvest profits
- Compound gains

## Dynamic Pricing
- Adjust based on market movement
- Drop price if not selling
- Raise if trending hot
- Monitor constantly`
  },
  {
    lesson_number: 7,
    title: 'Auction vs Fixed Price Strategy',
    description: 'Choose the right selling method for maximum returns.',
    content: `# Lesson 7: Auction vs Fixed Price Strategy

Different selling formats for different situations.

## Auctions Win When
- Card is hot and rising
- Demand is high
- You want maximum price
- Condition is subjective

## Fixed Price Win When
- Price is clearly established
- Want predictable income
- Don't want competition
- Speed is priority

## Hybrid Approach
- Use auctions for trending hot cards
- Use fixed price for stable inventory
- List cheaper items fixed, valuable items auction
- Watch and adjust based on results

## Platform Differences
- eBay auctions = wider audience
- Fixed prices = less competition
- Multiple platforms = arbitrage opportunities`
  },
  {
    lesson_number: 8,
    title: 'Platform Selection & Fees',
    description: 'Understand fees and platform strengths.',
    content: `# Lesson 8: Platform Selection & Fees

Fees directly impact profit margins.

## Fee Structure
- **eBay**: 12-15% of sale (various fees)
- **TCGPlayer**: 8-10% for TCG
- **Facebook**: Minimal fees, lower reach
- **Direct Sales**: No fees, slower

## Net Profit Calculation
- Account for all fees upfront
- Shipping costs reduce margin
- Payment processing fees
- Packaging materials

## Platform Strengths
- **eBay**: Largest audience, auctions
- **TCGPlayer**: TCG specialists
- **Specialized Sites**: Niche audiences
- **Local**: No shipping, quick cash

## Strategy
- Use best platform for each card type
- Arbitrage between platforms
- Optimize for net profit, not gross`
  },
  {
    lesson_number: 9,
    title: 'Inventory Management for Flippers',
    description: 'Track inventory efficiently and avoid dead stock.',
    content: `# Lesson 9: Inventory Management for Flippers

Good inventory management prevents losing money.

## Tracking System
- Know exactly what you have
- Track purchase cost
- Monitor holding time
- Calculate potential profit
- Flag slow movers

## Avoiding Dead Stock
- Set holding period limits
- Reduce price if not selling
- Bundle slow movers with hot items
- Don't hold losers hoping to recover
- Take tax losses strategically

## Cash Flow
- Sell faster than you buy
- Reinvest profits from sales
- Avoid tying up cash
- Maintain working capital
- Keep inventory moving

## Metrics to Track
- Days held per card
- Sell-through rate
- Profit per card
- Profit per day holding
- Total inventory value`
  },
  {
    lesson_number: 10,
    title: 'Seasonal Flipping Cycles',
    description: 'Time your flips with seasonal market movements.',
    content: `# Lesson 10: Seasonal Flipping Cycles

Seasonality creates profit opportunities.

## Holiday Seasons
- Increased buying in November/December
- Gift giving drives demand
- Prices peak before holidays
- Sell before, buy after

## Sports Seasonality
- Rookie season drives prices
- Playoff runs create spikes
- Draft periods = opportunity
- Off-season = lower prices

## Product Cycles
- New releases = initial hype
- 6-8 weeks = peak demand
- 3 months in = cooling
- Buy old sets when cheap

## Flip Strategy by Season
- Spring: Sports performance spikes
- Summer: Gift purchasing planning
- Fall: Holiday season preparation
- Winter: New release hype

## Calendar-Based Profits
Plan flips around predictable cycles.`
  },
  {
    lesson_number: 11,
    title: 'Building Your Flipping Network',
    description: 'Create relationships that feed your pipeline.',
    content: `# Lesson 11: Building Your Flipping Network

Great flippers have reliable sourcing networks.

## Network Types
- **Collectors**: Sell their collections
- **Dealers**: Buy bulk, wholesale deals
- **Shops**: Source overstock
- **Other Flippers**: Learn and collaborate

## Building Relationships
- Fair dealing builds reputation
- Consistent buying = better prices
- Quick payment = partner loyalty
- Integrity = long-term partnerships

## Communication
- Regular outreach
- Express interest in inventory
- Make fast offers
- Pay promptly
- Show appreciation

## Network Benefits
- First access to inventory
- Better pricing through relationships
- Deal flow consistency
- Collaborative intelligence
- Mutual support`
  },
  {
    lesson_number: 12,
    title: 'Risk Management for Flippers',
    description: 'Protect profits through smart risk strategies.',
    content: `# Lesson 12: Risk Management for Flippers

Most flippers lose money. Be the exception.

## Risk Mitigation
- Diversify across card types
- Don't chase one trend
- Limit risk per flip
- Know your max loss
- Have exit plans

## Authentication Risks
- Verify authenticity before buying
- Sell authentic only
- Document condition
- Use buyer protection
- Protect reputation

## Market Risks
- Card could cool suddenly
- Graded card might grade lower
- Platform changes fees
- Competitor flooding
- Economic shifts

## Protecting Profit
- Take profits early
- Don't hold losers
- Move inventory before peaks
- Keep cash reserves
- Be ready to pivot`
  },
  {
    lesson_number: 13,
    title: 'From Flipping to Business',
    description: 'Scale your flipping operation intentionally.',
    content: `# Lesson 13: From Flipping to Business

Flipping can become a real business.

## Scaling Gradually
- Start small, prove profitability
- Reinvest all profits
- Document everything
- Track metrics carefully
- Know your numbers

## Operation Considerations
- Dedicated workspace
- Organized inventory system
- Fast listing process
- Customer service protocols
- Financial tracking

## Tax Implications
- Business income is taxable
- Keep detailed records
- Understand business structure
- Consult tax professional
- Plan for quarterly taxes

## Professionalization
- Professional listings
- Reliable shipping
- Excellent communication
- Handle issues quickly
- Build reputation systematically`
  },
  {
    lesson_number: 14,
    title: 'Technology & Tools for Flippers',
    description: 'Leverage technology to scale your operation.',
    content: `# Lesson 14: Technology & Tools for Flippers

The right tools multiply your output.

## Essential Tools
- **Price Tracking**: Monitor comps in real-time
- **Alerts**: Notify you of opportunities
- **Inventory Management**: Track your stock
- **Listing Tools**: Speed up selling process
- **Shipping**: Automate and optimize

## Time Savers
- Batch listing similar items
- Template descriptions
- Standard shipping labels
- Bulk pricing options
- Automated communications

## Data Analysis
- Track profitability by card type
- Identify best-performing categories
- Optimize inventory mix
- Analyze by season
- Find your best flips

## Origins Integration
Use Origins tools to monitor markets and spot trends.`
  },
  {
    lesson_number: 15,
    title: 'The Flipper\'s Path Forward',
    description: 'You\'re ready to execute profitable flips.',
    content: `# Lesson 15: The Flipper\'s Path Forward

You have the knowledge to flip profitably.

## Action Plan
1. Set up tracking system
2. Learn your category deeply
3. Practice on small flips
4. Prove profitability
5. Scale gradually
6. Reinvest profits
7. Build reputation
8. Track every flip

## Keys to Success
- Speed matters
- Data drives decisions
- Relationships matter
- Integrity builds reputation
- Consistency wins

## Remember
- Not every flip succeeds
- Losses happen
- Average wins matter most
- Cash flow is critical
- Building takes time

## The Journey
From first flip to professional dealer. You've got this.`
  }
];

const BUSINESS_LESSONS = (category, cardTypes) => [
  {
    lesson_number: 1,
    title: 'Card Business Fundamentals',
    description: 'Understand the professional card business model.',
    content: `# Lesson 1: Card Business Fundamentals

Running a card business is serious entrepreneurship.

## Business Models
- **Retail Shop**: Physical location, consistent traffic
- **Online Store**: Broader reach, lower overhead
- **Wholesaler**: Source and distribute to retailers
- **Hybrid**: Mix of retail and wholesale

## Revenue Streams
- Product sales (bulk, singles, graded)
- Grading partnerships
- Commission on consignment
- Service fees (authentication, appraisal)
- Content monetization

## Success Factors
- Deep market knowledge
- Excellent customer service
- Operational efficiency
- Capital management
- Reputation building`
  },
  {
    lesson_number: 2,
    title: 'Market Segmentation & Specialization',
    description: 'Choose your niche and dominate it.',
    content: `# Lesson 2: Market Segmentation & Specialization

Successful businesses specialize.

## Niche Selection
- **Modern vs Vintage**: Different markets, different customers
- **Card Type Focus**: Specialize in one category
- **Price Point**: Budget, mid, or premium
- **Grade Focus**: Raw, bulk, or high-grade
- **Service Model**: Retail, wholesale, or service

## Market Research
- Identify underserved segments
- Understand customer needs
- Assess competition
- Know demand patterns
- Find your edge

## Competitive Positioning
- Be the expert in your niche
- Serve your customers uniquely
- Build moat around specialty
- Create switching costs
- Dominate your segment

## Scaling Through Specialization
Deep expertise = higher margins + customer loyalty.`
  },
  {
    lesson_number: 3,
    title: 'Sourcing Strategy for Businesses',
    description: 'Build reliable sourcing pipelines.',
    content: `# Lesson 3: Sourcing Strategy for Businesses

Great businesses have great sourcing.

## Sourcing Channels
- **Direct Collectors**: Buy collections
- **Estate Sales**: Bulk vintage inventory
- **Liquidations**: Close-outs and overstock
- **Wholesale**: Established dealer networks
- **Product Distribution**: Official distributors

## Building Supplier Relationships
- Consistent purchasing
- Fair pricing
- Reliable payment
- Transparent communication
- Long-term partnerships

## Inventory Planning
- Forecast demand
- Maintain stock levels
- Turn inventory efficiently
- Don't overstock
- Manage cash flow

## Sourcing at Scale
- Multiple reliable suppliers
- Backup relationships
- Negotiated pricing
- Volume commitments
- Long-term contracts

## Cost Management
Lower sourcing cost = higher margins.`
  },
  {
    lesson_number: 4,
    title: 'Retail Operations & Customer Service',
    description: 'Run a professional retail operation.',
    content: `# Lesson 4: Retail Operations & Customer Service

Customer experience drives success.

## Store Operations
- Professional environment
- Organized inventory
- Clear pricing
- Expert staff
- Engaging displays

## Customer Service Excellence
- Know your products
- Listen to customers
- Solve problems quickly
- Build relationships
- Ask for feedback

## Retail Metrics
- Foot traffic
- Conversion rate
- Average transaction value
- Customer lifetime value
- Repeat purchase rate

## Building Loyalty
- Loyalty programs
- Regular events
- Community engagement
- Exclusive access
- Personal relationships

## Growth Through Service
Great service = word-of-mouth growth = sustainable business.`
  },
  {
    lesson_number: 5,
    title: 'Pricing Strategy for Profitability',
    description: 'Set prices that maximize profit and competitiveness.',
    content: `# Lesson 5: Pricing Strategy for Profitability

Smart pricing drives business success.

## Pricing Framework
- Cost-plus: Cost + target margin %
- Value-based: Price based on market
- Competitive: Match or beat others
- Dynamic: Adjust based on demand
- Premium: High-value positioning

## Margin Requirements
- Cost of goods: 40-60% of price
- Operating expenses: 15-25%
- Target profit: 15-35%
- Avoid race to bottom pricing
- Maintain margins over volume chasing

## Price Optimization
- Test different price points
- Monitor sales impact
- Adjust for competition
- Seasonal adjustments
- Bundle pricing strategies

## Psychology
- Price signals quality
- Psychological pricing
- Anchor pricing
- Discount strategy
- Perceived value

## Balance
Competitiveness with profitability.`
  },
  {
    lesson_number: 6,
    title: 'Authentication & Quality Control',
    description: 'Protect reputation through strict quality standards.',
    content: `# Lesson 6: Authentication & Quality Control

Your reputation depends on authenticity.

## Authentication System
- Expert verification process
- Photo documentation
- Condition assessment
- Grading guidelines
- Warranty policies

## Quality Standards
- Describe accurately
- Stand behind quality
- Take returns willingly
- Fix problems quickly
- Build trust

## Preventing Counterfeits
- Know your suppliers
- Verify authenticity
- Document everything
- Educate customers
- Report fakes

## Industry Standards
- Join trade associations
- Follow best practices
- Maintain certifications
- Stay updated
- Network with peers

## Protection
Your reputation = your asset. Protect it fiercely.`
  },
  {
    lesson_number: 7,
    title: 'Financial Management & Accounting',
    description: 'Run the financial side like a professional.',
    content: `# Lesson 7: Financial Management & Accounting

Numbers tell the truth about your business.

## Financial Tracking
- Revenue by category
- Cost of goods sold
- Operating expenses
- Gross margin %
- Net profit %

## Cash Flow Management
- Money in vs money out
- Inventory investment
- Receivables management
- Payment timing
- Reserve building

## Accounting Basics
- Chart of accounts
- Regular reconciliation
- Expense tracking
- Inventory valuation
- Profit and loss statements

## Tax Planning
- Quarterly estimated taxes
- Business structure
- Deduction optimization
- Record keeping
- Consult professionals

## Business Health Metrics
- Gross margin
- Operating margin
- Return on investment
- Inventory turns
- Customer acquisition cost`
  },
  {
    lesson_number: 8,
    title: 'Grading Partnerships & Services',
    description: 'Partner with grading companies strategically.',
    content: `# Lesson 8: Grading Partnerships & Services

Grading partnerships amplify profit.

## Grading Relationships
- Establish dealer accounts
- Negotiate volume discounts
- Learn turnaround options
- Build consistent pipeline
- Develop feeders

## Grading Strategy
- Buy raw, grade, sell graded
- Identify high-potential cards
- Submit before market peaks
- Manage costs carefully
- Track success rates

## Grading Services
- Offer grading consultation
- Partner with graders
- Resell graded inventory
- Provide authentication
- Build expertise

## Margin Enhancement
Grading transforms inventory into premium products.`
  },
  {
    lesson_number: 9,
    title: 'Online & Omnichannel Sales',
    description: 'Sell effectively across multiple channels.',
    content: `# Lesson 9: Online & Omnichannel Sales

Reach customers wherever they are.

## Sales Channels
- **Website**: Your owned platform
- **eBay**: Largest audience
- **Specialized Platforms**: TCGPlayer, etc.
- **Social Media**: Direct sales
- **In-Person**: Retail and shows

## Online Excellence
- Professional listings
- High-quality photos
- Clear descriptions
- Competitive pricing
- Fast response
- Great shipping

## Inventory Sync
- Real-time stock management
- Prevent overselling
- Coordinate across channels
- Efficient fulfillment
- Customer satisfaction

## Channel Strategy
- Mix of high and low margin
- Different products per channel
- Customer segmentation
- Scale what works
- Abandon what doesn't

## Growth
Multi-channel = bigger business.`
  },
  {
    lesson_number: 10,
    title: 'Marketing & Customer Acquisition',
    description: 'Build a customer base and stay top-of-mind.',
    content: `# Lesson 10: Marketing & Customer Acquisition

Great products need great marketing.

## Marketing Channels
- **Content**: Blog, videos, guides
- **Social Media**: Regular engagement
- **Email**: Build mailing list
- **Community**: Forums, groups
- **Partnerships**: Influencers, collab
- **Paid Ads**: Targeted campaigns

## Content Strategy
- Educational content
- Trend spotting
- Expert opinions
- Market insights
- Community involvement

## Customer Loyalty
- Email list building
- Regular communication
- Exclusive offers
- VIP programs
- Referral incentives

## Brand Building
- Consistent voice
- Expert positioning
- Quality assurance
- Responsive communication
- Community respect

## Sustainable Growth
Content and community = organic growth.`
  },
  {
    lesson_number: 11,
    title: 'Staffing & Team Building',
    description: 'Scale through excellent people.',
    content: `# Lesson 11: Staffing & Team Building

Great businesses have great teams.

## Hiring Strategy
- Define roles clearly
- Look for passion
- Train thoroughly
- Retain best people
- Pay fairly

## Training & Development
- Product knowledge
- Customer service
- Sales skills
- Inventory management
- Problem solving

## Team Culture
- Mission-driven
- Quality-focused
- Customer-centric
- Continuous learning
- Supportive environment

## Delegation
- Free yourself for strategy
- Empower staff
- Trust and verify
- Share success
- Celebrate wins

## Scaling Through People
Your team multiplies your impact.`
  },
  {
    lesson_number: 12,
    title: 'Inventory Optimization',
    description: 'Maximize inventory efficiency and profitability.',
    content: `# Lesson 12: Inventory Optimization

Efficient inventory = healthy business.

## Inventory Management
- Real-time tracking
- ABC analysis (high/med/low value)
- Obsolescence prevention
- Valuation methods
- Regular audits

## Turnover Metrics
- Days inventory outstanding
- Turnover rate by category
- Identify slow movers
- Seasonal adjustments
- Target improvements

## Capital Efficiency
- Don't overstock
- Turn inventory fast
- Manage cash carefully
- Avoid dead stock
- Reinvest profits

## Technology
- Inventory management software
- Barcode systems
- Real-time updates
- Analytics and reporting
- Mobile access

## Balance
Enough inventory for sales + fast enough turnover.`
  },
  {
    lesson_number: 13,
    title: 'Competitive Positioning & Differentiation',
    description: 'Create sustainable competitive advantages.',
    content: `# Lesson 13: Competitive Positioning & Differentiation

Commodities compete on price. Leaders compete on value.

## Your Edge
- Expertise and knowledge
- Curation and selection
- Customer experience
- Service level
- Community presence

## Sustainable Advantages
- Brand reputation
- Customer relationships
- Supplier relationships
- Operational efficiency
- Market data/insights

## Against Competition
- Higher quality
- Better service
- Deeper expertise
- Stronger community
- Reliable consistency

## Moat Building
- Build switching costs
- Create loyalty
- Develop brand
- Network effects
- Exclusive relationships

## Defensibility
What makes you hard to replicate?`
  },
  {
    lesson_number: 14,
    title: 'Growth Strategies & Scaling',
    description: 'Plan for sustainable, profitable growth.',
    content: `# Lesson 14: Growth Strategies & Scaling

Smart growth builds lasting business.

## Growth Paths
- **Expansion**: New categories or segments
- **Channel Growth**: More sales channels
- **Geographic**: New markets/locations
- **Product Services**: Add services
- **Acquisition**: Buy competitors

## Scaling Operations
- Systems and processes
- Technology infrastructure
- Team expansion
- Capital requirements
- Risk management

## Growth Metrics
- Revenue growth
- Margin maintenance
- Customer satisfaction
- Operational efficiency
- Team morale

## Avoid Traps
- Grow too fast (cash flow crash)
- Sacrifice quality for volume
- Lose operational control
- Burn out team
- Ignore profitability

## Sustainable Growth
Slow and steady builds lasting empires.`
  },
  {
    lesson_number: 15,
    title: 'Your Professional Card Business',
    description: 'You\'re ready to build a serious business.',
    content: `# Lesson 15: Your Professional Card Business

You have the knowledge to run a successful business.

## Your Blueprint
1. Choose your niche
2. Build sourcing
3. Establish operations
4. Create systems
5. Build team
6. Market aggressively
7. Track metrics
8. Optimize continuously

## Keys to Success
- Deep expertise
- Excellent service
- Operational discipline
- Financial management
- Community respect

## Remember
- Business takes time
- Cash flow is critical
- Your reputation is everything
- Great people matter
- Continuous learning required

## The Journey
From idea to profitable business. You have the roadmap.`
  }
];

const generateLessons = (useCase, category, cardTypes) => {
  if (useCase === 'collecting') return COLLECTOR_LESSONS(category, cardTypes);
  if (useCase === 'flipping') return FLIPPER_LESSONS(category, cardTypes);
  if (useCase === 'business') return BUSINESS_LESSONS(category, cardTypes);
  return COLLECTOR_LESSONS(category, cardTypes);
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Delete existing master plans
    const existing = await base44.asServiceRole.entities.LearningPlan.list();
    for (const plan of existing) {
      if (plan.name.includes('Mastery')) {
        await base44.asServiceRole.entities.LearningPlan.delete(plan.id);
      }
    }

    // Create plans for each use case
    const results = {};

    for (const useCase of ['collecting', 'flipping', 'business']) {
      // Sports Cards
      const sportTypes = Object.values(SPORTS_CARDS_INFO);
      const sportLessons = generateLessons(useCase, 'Sports Cards', sportTypes);
      
      const sportPlan = await base44.asServiceRole.entities.LearningPlan.create({
        name: `Sports Cards - ${useCase.charAt(0).toUpperCase() + useCase.slice(1)}`,
        description: `Complete guide to sports card ${useCase}: Baseball, Basketball, Football, Hockey, Soccer, Golf, UFC, and WWE.`,
        card_interests: Object.keys(SPORTS_CARDS_INFO),
        use_case: useCase,
        category: 'sports_cards',
        lessons: sportLessons,
        total_lessons: sportLessons.length,
        is_active: true
      });

      // TCG
      const tcgTypes = Object.values(TCG_INFO);
      const tcgLessons = generateLessons(useCase, 'Trading Card Games', tcgTypes);
      
      const tcgPlan = await base44.asServiceRole.entities.LearningPlan.create({
        name: `Trading Card Games - ${useCase.charAt(0).toUpperCase() + useCase.slice(1)}`,
        description: `Complete guide to TCG ${useCase}: Pokémon, Magic: The Gathering, Yu-Gi-Oh!, One Piece, and Lorcana.`,
        card_interests: Object.keys(TCG_INFO),
        use_case: useCase,
        category: 'tcg',
        lessons: tcgLessons,
        total_lessons: tcgLessons.length,
        is_active: true
      });

      results[useCase] = {
        sports: { id: sportPlan.id, lessons: sportLessons.length },
        tcg: { id: tcgPlan.id, lessons: tcgLessons.length }
      };
    }

    return Response.json({
      success: true,
      plans_created: results
    });
  } catch (error) {
    console.error('Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});