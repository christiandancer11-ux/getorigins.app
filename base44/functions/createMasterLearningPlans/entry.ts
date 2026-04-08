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

const generateProgressiveLessons = (category, cardTypes) => {
  const lessons = [
    {
      lesson_number: 1,
      title: 'Getting Started with Card Collecting',
      description: 'Learn the basics of what makes a great collection and set your collecting goals.',
      content: `# Lesson 1: Getting Started with Card Collecting

Welcome to your card collecting journey! This first lesson covers the fundamentals of collecting.

## What is Card Collecting?
Card collecting is both a hobby and an investment. Collectors acquire cards for various reasons:
- Personal enjoyment and connection to the game/sport
- Investment potential and value appreciation
- Nostalgia and building complete sets
- Rarity and exclusivity

## Why Collect Cards?
- **Portfolio Building**: Cards can appreciate over time
- **Community**: Connect with other collectors
- **Achievement**: Complete sets and chase rare cards
- **Fun**: Enjoy the thrill of the hunt

## Your First Steps
1. Decide what you want to collect
2. Set a budget for your hobby
3. Learn about card types and rarity
4. Start small and grow strategically`,
      key_takeaways: [
        'Card collecting combines hobby enjoyment with investment potential',
        'Set clear goals before you start collecting',
        'Start small and scale up as you learn',
        'Community engagement enhances the experience'
      ],
      learning_resources: [
        { title: 'Origins Watchlist Feature', url: '#/watchlist', type: 'tool', platform: 'origins' },
        { title: 'Collector Profiles', url: '#/users', type: 'guide', platform: 'origins' }
      ],
      practical_exercise: 'Create your Origins profile and write down your collecting goals.',
      origins_feature_integration: 'Use your Origins profile to showcase your collecting interests.'
    },
    {
      lesson_number: 2,
      title: 'Understanding Card Rarity and Value',
      description: 'Learn how rarity levels determine card value and market demand.',
      content: `# Lesson 2: Understanding Card Rarity and Value

Rarity is one of the most important factors in determining a card's value.

## Rarity Tiers
- **Common**: Easy to find, lower value
- **Uncommon**: Harder to find, moderate value
- **Rare**: Difficult to find, higher value
- **Ultra Rare**: Very hard to find, significant value
- **Legendary**: Extremely rare, premium pricing
- **1 of 1**: One-of-a-kind cards, highest value

## How Rarity Affects Price
Cards with lower print runs command higher prices. Understanding print runs helps you identify undervalued opportunities.

## Condition Matters
Even rare cards lose value if damaged. Card condition is graded on a scale of 1-10.`,
      key_takeaways: [
        'Rarity tiers range from common to 1 of 1',
        'Lower print runs = higher potential value',
        'Card condition dramatically affects price',
        'Combine rarity and condition for accurate valuations'
      ],
      learning_resources: [
        { title: 'Market Value Tool', url: '#/market', type: 'tool', platform: 'origins' },
        { title: 'Grading Guide', url: '#/card-show', type: 'guide', platform: 'origins' }
      ],
      practical_exercise: 'Find 3 cards of different rarity levels and compare their market values.',
      origins_feature_integration: 'Use the Market Value tool to research card prices by rarity.'
    },
    {
      lesson_number: 3,
      title: 'Grading and Condition Assessment',
      description: 'Master the art of evaluating card condition and understanding grading standards.',
      content: `# Lesson 3: Grading and Condition Assessment

Professional grading is crucial for high-value cards.

## Grading Companies
- **PSA (Professional Sports Authenticators)**: Industry standard
- **BGS (Beckett Grading Services)**: Vintage and modern
- **SGC (Sportscard Guarantee Company)**: Historical cards
- **CGC (Certified Guaranty Company)**: Comics and cards

## Grading Scale (1-10)
- 10: Gem Mint - Flawless condition
- 9: Mint - Nearly perfect
- 8: Near Mint/Mint - Light wear
- 7: Near Mint - Slight wear
- 6-1: Descending condition levels

## Raw vs Graded Cards
Raw cards are ungraded, while graded cards are authenticated and slabbed. Graded cards typically command premium prices.`,
      key_takeaways: [
        'Professional grading adds value and authenticity',
        'Grade 9-10 cards command premium prices',
        'Different companies have different standards',
        'Grading costs must be factored into your strategy'
      ],
      learning_resources: [
        { title: 'AI Card Grading Tool', url: '#/ai-grading', type: 'tool', platform: 'origins' },
        { title: 'Grading Comparison', url: '#/card-show', type: 'guide', platform: 'origins' }
      ],
      practical_exercise: 'Use Origins AI Grading to assess 5 cards in your collection.',
      origins_feature_integration: 'Log graded cards with cert numbers to track your portfolio.'
    },
    {
      lesson_number: 4,
      title: 'Market Trends and Price Movement',
      description: 'Learn how to identify market trends and spot price opportunities.',
      content: `# Lesson 4: Market Trends and Price Movement

Understanding market dynamics helps you buy low and sell high.

## Factors That Drive Prices
- **Player/Character Performance**: Major achievements boost card values
- **Set Scarcity**: Limited print runs increase value
- **Nostalgia Waves**: Older cards resurge in popularity
- **Media Hype**: Movies, shows, and news events affect prices
- **Condition Availability**: Fewer high-grade copies = higher prices

## Reading the Market
Market trends show patterns over weeks and months. Hot cards experience rapid price increases, while cooling cards decline.

## Risk Management
Never chase peaks. Wait for dips and accumulate strategically.`,
      key_takeaways: [
        'Multiple factors drive card prices',
        'Trends are easier to spot with data',
        'Media events create temporary spikes',
        'Patience and strategy beat impulse buying'
      ],
      learning_resources: [
        { title: 'Trending Cards', url: '#/trending', type: 'tool', platform: 'origins' },
        { title: 'Market Picks', url: '#/market', type: 'guide', platform: 'origins' }
      ],
      practical_exercise: 'Track 3 cards over 2 weeks and note price movements.',
      origins_feature_integration: 'Use Price Alerts to monitor cards you want to buy.'
    },
    {
      lesson_number: 5,
      title: 'Building Your First Collection',
      description: 'Create a strategic plan for starting your card collection.',
      content: `# Lesson 5: Building Your First Collection

Now it's time to put theory into practice.

## Collection Strategy
1. Pick a focus: Complete sets, specific players, or era
2. Set a budget: Know how much you can spend
3. Start quality over quantity: Fewer good cards beat many mediocre ones
4. Keep records: Track what you own and why

## Where to Buy
- **Online**: eBay, TCGPlayer, dedicated retailers
- **Local**: Card shops and shows
- **Direct**: From collectors and dealers

## Avoiding Fakes
Be careful of counterfeit cards. Learn the authentication basics for your card type.`,
      key_takeaways: [
        'Choose a specific collection focus',
        'Start with quality cards within your budget',
        'Document your collection from day one',
        'Verify authenticity before purchasing'
      ],
      learning_resources: [
        { title: 'Register Cards', url: '#/register', type: 'tool', platform: 'origins' },
        { title: 'Collection Analytics', url: '#/analytics', type: 'guide', platform: 'origins' }
      ],
      practical_exercise: 'Register your first 5-10 cards in Origins.',
      origins_feature_integration: 'Log cards in Origins to start building your portfolio.'
    },
    {
      lesson_number: 6,
      title: 'Mastering ${category} Specifics - Part 1',
      description: `Deep dive into the characteristics of the first half of ${category} types.`,
      content: `# Lesson 6: Mastering ${category} Specifics - Part 1

Each ${category.toLowerCase()} type has unique characteristics.

## Introduction
${cardTypes.slice(0, 4).map((ct, i) => `### ${ct.name} (${ct.icon})
${ct.desc}`).join('\n\n')}

## Key Differences
Each type has unique:
- Grading standards
- Market dynamics
- Collector preferences
- Investment potential`,
      key_takeaways: [
        `${cardTypes[0].name} has unique market characteristics`,
        `${cardTypes[1].name} follows different value patterns`,
        `${cardTypes[2].name} appeals to specific collectors`,
        `${cardTypes[3].name} has emerging opportunities`
      ],
      learning_resources: [
        { title: 'Market Value Tool', url: '#/market', type: 'tool', platform: 'origins' },
        { title: 'Trending Analysis', url: '#/trending', type: 'guide', platform: 'origins' }
      ],
      practical_exercise: `Research and add 2 cards from each of the first 4 ${category.toLowerCase()} types to your watchlist.`,
      origins_feature_integration: 'Compare market values across different card types.'
    },
    {
      lesson_number: 7,
      title: 'Mastering ${category} Specifics - Part 2',
      description: `Learn the nuances of the remaining ${category} types.`,
      content: `# Lesson 7: Mastering ${category} Specifics - Part 2

Complete your understanding of all ${category} types.

## Continued Exploration
${cardTypes.slice(4).map((ct, i) => `### ${ct.name} (${ct.icon})
${ct.desc}`).join('\n\n')}

## Building a Diverse Portfolio
Collecting multiple card types spreads risk and provides more opportunities.`,
      key_takeaways: [
        `${cardTypes[4] ? cardTypes[4].name : 'Rare'} cards have unique investment profiles`,
        'Diversification reduces collecting risk',
        'Each type rewards different strategies',
        'Cross-type knowledge helps identify arbitrage'
      ],
      learning_resources: [
        { title: 'Trending Cards', url: '#/trending', type: 'tool', platform: 'origins' },
        { title: 'Market Picks', url: '#/market', type: 'guide', platform: 'origins' }
      ],
      practical_exercise: `Add 2 cards from each remaining ${category.toLowerCase()} type to your collection.`,
      origins_feature_integration: 'Track portfolio performance across card types.'
    },
    {
      lesson_number: 8,
      title: 'Authentication and Avoiding Counterfeits',
      description: 'Learn to spot fake cards and verify authenticity.',
      content: `# Lesson 8: Authentication and Avoiding Counterfeits

Counterfeit cards are a serious problem in the hobby.

## Red Flags
- Suspiciously low prices
- Poor print quality
- Slightly off colors or fonts
- Missing security features
- Inconsistent cardstock weight

## Verification Tips
1. Compare to known authentic examples
2. Check for security features (holograms, watermarks)
3. Feel the card weight and texture
4. Examine corners and edges closely

## Trusted Sources
Buy from established dealers and certified sellers.`,
      key_takeaways: [
        'Counterfeits damage the hobby and your collection',
        'Inspect cards carefully before purchasing',
        'Buy from reputable sources',
        'Get high-value cards professionally graded'
      ],
      learning_resources: [
        { title: 'Card Detail View', url: '#/cards/sample', type: 'guide', platform: 'origins' }
      ],
      practical_exercise: 'Research authentication features for your favorite card type.',
      origins_feature_integration: 'Log cards with cert numbers for verified authenticity.'
    },
    {
      lesson_number: 9,
      title: 'Setting Up Price Alerts',
      description: 'Learn to use price alerts to find buying opportunities.',
      content: `# Lesson 9: Setting Up Price Alerts

Price alerts help you capitalize on market movements.

## How Price Alerts Work
Set target prices for cards you want to buy. Get notified when prices drop to your target.

## Alert Strategy
- Set alerts below current market price
- Monitor multiple cards in your target area
- Be ready to act quickly when alerts trigger
- Adjust alerts as market conditions change

## Smart Alert Placement
Research historical prices to set realistic targets.`,
      key_takeaways: [
        'Price alerts automate opportunity detection',
        'Set alerts at realistic below-market prices',
        'Be prepared to act quickly',
        'Track alert history to refine strategy'
      ],
      learning_resources: [
        { title: 'Price Alerts', url: '#/alerts', type: 'tool', platform: 'origins' }
      ],
      practical_exercise: 'Set price alerts for 5 cards you want to acquire.',
      origins_feature_integration: 'Use Origins Price Alerts for automatic notifications.'
    },
    {
      lesson_number: 10,
      title: 'Trading and Selling Cards',
      description: 'Master the art of trading cards profitably.',
      content: `# Lesson 10: Trading and Selling Cards

Eventually you'll want to trade or sell cards.

## Setting Fair Prices
- Research recent sold listings
- Factor in condition and rarity
- Consider market trends
- Account for fees if selling online

## Trading vs Selling
- **Trading**: Direct card-for-card exchanges
- **Selling**: Converting to cash

## Building Reputation
- Fair pricing builds trust
- Quick shipping matters
- Respond to inquiries promptly
- Be honest about card condition

## Tax Considerations
Keep records for tax purposes if you're a serious collector.`,
      key_takeaways: [
        'Research comparable sales before pricing',
        'Fair pricing builds trading reputation',
        'Choose trading or selling based on goals',
        'Documentation matters for serious collectors'
      ],
      learning_resources: [
        { title: 'Trade Dashboard', url: '#/trade-dashboard', type: 'tool', platform: 'origins' },
        { title: 'Card Show', url: '#/card-show', type: 'guide', platform: 'origins' }
      ],
      practical_exercise: 'Log a trade or sale transaction in Origins.',
      origins_feature_integration: 'Use Trade Dashboard to log all transactions.'
    },
    {
      lesson_number: 11,
      title: 'Portfolio Management Basics',
      description: 'Learn to track and analyze your collection as an investment.',
      content: `# Lesson 11: Portfolio Management Basics

Serious collectors treat their collection as a portfolio.

## Tracking Your Collection
Document every card with:
- Card name and details
- Purchase price
- Current market value
- Condition/grade
- Date acquired

## Key Metrics
- **Total Value**: Sum of all card values
- **Cost Basis**: Total spent on collection
- **Unrealized Gains**: Current value minus cost
- **Return on Investment**: Gains divided by investment

## Rebalancing
Periodically review your collection. Sell underperformers to buy better opportunities.`,
      key_takeaways: [
        'Detailed documentation drives better decisions',
        'Regularly calculate portfolio metrics',
        'Track realized and unrealized gains',
        'Rebalance based on market conditions'
      ],
      learning_resources: [
        { title: 'Analytics Dashboard', url: '#/analytics', type: 'tool', platform: 'origins' },
        { title: 'Portfolio Tracker', url: '#/dashboard', type: 'guide', platform: 'origins' }
      ],
      practical_exercise: 'Review your collection value in Origins Analytics.',
      origins_feature_integration: 'Use Analytics to track portfolio performance.'
    },
    {
      lesson_number: 12,
      title: 'Advanced Grading Strategies',
      description: 'Go deeper into grading decisions and when to grade cards.',
      content: `# Lesson 12: Advanced Grading Strategies

Not every card deserves professional grading.

## Cost-Benefit Analysis
Grading costs $20-100+ per card. Only grade cards where the value justification exists.

## Grading Decision Framework
- **Grade if**: Card value > (grading cost × 2)
- **Skip if**: Card value < grading cost + market increase potential

## Timing Your Grades
Grade high-potential raw cards before market spikes for maximum gain.

## Bulk Grading
Submit multiple cards at once to reduce per-card costs.`,
      key_takeaways: [
        'Only grade cards with sufficient value',
        'Calculate ROI before submitting for grading',
        'Timing can significantly impact returns',
        'Bulk submissions reduce per-card costs'
      ],
      learning_resources: [
        { title: 'AI Card Grading', url: '#/ai-grading', type: 'tool', platform: 'origins' }
      ],
      practical_exercise: 'Identify 3 cards from your collection that justify professional grading.',
      origins_feature_integration: 'Use AI Grading to estimate grades before submitting.'
    },
    {
      lesson_number: 13,
      title: 'Spotting Market Opportunities',
      description: 'Learn advanced techniques for finding undervalued cards.',
      content: `# Lesson 13: Spotting Market Opportunities

Great investors find value before the market does.

## Undervalued Cards
- Cards of emerging players/characters
- Older sets returning to relevance
- Cards with sudden hype potential
- Graded cards at steep discounts

## Data-Driven Analysis
- Compare prices across platforms
- Track price history for patterns
- Monitor social media for trends
- Follow content creators in your niche

## Risk vs Reward
High-risk opportunities offer higher potential returns but require careful analysis.`,
      key_takeaways: [
        'Emerging opportunities exist everywhere',
        'Data analysis beats guessing',
        'Follow trends before they peak',
        'Research deeply before investing heavily'
      ],
      learning_resources: [
        { title: 'Trending Cards', url: '#/trending', type: 'tool', platform: 'origins' },
        { title: 'Social Feed', url: '#/feed', type: 'guide', platform: 'origins' }
      ],
      practical_exercise: 'Identify 2 undervalued cards and add them to your watchlist.',
      origins_feature_integration: 'Monitor trending cards and social community insights.'
    },
    {
      lesson_number: 14,
      title: 'Long-Term Collection Strategy',
      description: 'Develop a sustainable, long-term approach to card collecting.',
      content: `# Lesson 14: Long-Term Collection Strategy

Think years and decades, not days and weeks.

## Multi-Year Planning
- Set 1, 5, and 10-year goals
- Build toward specific collections
- Create a completion checklist
- Celebrate milestones

## Sustainability
- Maintain realistic budgets
- Balance collecting with selling
- Prevent hoarding and fatigue
- Enjoy the journey

## Legacy Building
Some collectors view their collections as legacy items to pass to family.`,
      key_takeaways: [
        'Long-term planning beats day trading',
        'Set clear collection goals',
        'Balance spending with income',
        'Enjoy collecting as a hobby first'
      ],
      learning_resources: [
        { title: 'Dashboard Overview', url: '#/dashboard', type: 'tool', platform: 'origins' },
        { title: 'Profile Analytics', url: '#/profile', type: 'guide', platform: 'origins' }
      ],
      practical_exercise: 'Document your 5-year collecting goals in your profile.',
      origins_feature_integration: 'Use dashboard to track long-term progress.'
    },
    {
      lesson_number: 15,
      title: 'Community Engagement and Networking',
      description: 'Join the collecting community and grow through connections.',
      content: `# Lesson 15: Community Engagement and Networking

The collecting community is welcoming and valuable.

## Ways to Engage
- Share your collection online
- Follow other collectors
- Participate in forums and discussions
- Attend card shows and conventions
- Join local collector groups

## Benefits of Community
- Learn from experienced collectors
- Find trading partners
- Discover new opportunities
- Develop friendships around shared interests

## Giving Back
Share your knowledge with newer collectors.`,
      key_takeaways: [
        'Community connections enhance the hobby',
        'Experienced collectors share valuable insights',
        'Trading partners find each other through networks',
        'Teaching others strengthens your own knowledge'
      ],
      learning_resources: [
        { title: 'Social Feed', url: '#/feed', type: 'tool', platform: 'origins' },
        { title: 'User Profiles', url: '#/users', type: 'guide', platform: 'origins' }
      ],
      practical_exercise: 'Follow 5 collectors in Origins and comment on their collections.',
      origins_feature_integration: 'Use social features to connect with the community.'
    },
    {
      lesson_number: 16,
      title: 'Advanced Market Analysis',
      description: 'Master sophisticated tools for market prediction.',
      content: `# Lesson 16: Advanced Market Analysis

Go beyond basic price checking with advanced analysis.

## Volume Analysis
Trading volume indicates market health. High volume on upward moves suggests strength.

## Pattern Recognition
- Cup and handle patterns signal breakouts
- Support and resistance levels guide entries
- Moving averages smooth price volatility
- Relative strength identifies outperformers

## Sentiment Analysis
Community interest and social media mentions correlate with price movements.`,
      key_takeaways: [
        'Trading volume confirms price trends',
        'Technical patterns help time entries',
        'Community sentiment drives short-term moves',
        'Combine multiple signals for better accuracy'
      ],
      learning_resources: [
        { title: 'Market Value Analytics', url: '#/market', type: 'tool', platform: 'origins' },
        { title: 'Trending Insights', url: '#/trending', type: 'guide', platform: 'origins' }
      ],
      practical_exercise: 'Track 3 cards and analyze their price patterns over a month.',
      origins_feature_integration: 'Use market tools to identify technical patterns.'
    },
    {
      lesson_number: 17,
      title: 'Risk Management and Portfolio Diversification',
      description: 'Protect your investment through smart diversification.',
      content: `# Lesson 17: Risk Management and Portfolio Diversification

Don't put all your eggs in one basket.

## Diversification Strategies
- Spread across multiple card types
- Vary card prices (cheap, mid, expensive)
- Mix old and new releases
- Balance speculative and stable cards

## Portfolio Balance
- 40% core holdings (stable, long-term)
- 30% growth plays (emerging opportunities)
- 20% speculative (high risk, high reward)
- 10% liquidity reserve

## Stop-Loss Strategy
Decide in advance when to exit losing positions.`,
      key_takeaways: [
        'Diversification reduces risk significantly',
        'Balance conservative and aggressive positions',
        'Have an exit plan for underperformers',
        'Portfolio allocation should match your risk tolerance'
      ],
      learning_resources: [
        { title: 'Analytics Dashboard', url: '#/analytics', type: 'tool', platform: 'origins' }
      ],
      practical_exercise: 'Audit your collection and rebalance toward your portfolio targets.',
      origins_feature_integration: 'Use Analytics to monitor portfolio diversification.'
    },
    {
      lesson_number: 18,
      title: 'Graduation: Building Your Trading System',
      description: 'Create your personalized trading and collecting system.',
      content: `# Lesson 18: Graduation - Building Your System

You now have the knowledge to build a complete system.

## Your Personal System
1. Define your collecting goals clearly
2. Create a sourcing strategy
3. Establish a valuation process
4. Set your trading rules
5. Implement tracking procedures
6. Review and adjust monthly

## Documentation
Write down your rules. Discipline matters more than intelligence in investing.

## Continuous Learning
Markets change. Stay updated with new trends and strategies.`,
      key_takeaways: [
        'Document your personal investment rules',
        'Consistency beats perfect timing',
        'Regular reviews improve results',
        'Adapt as markets evolve'
      ],
      learning_resources: [
        { title: 'Full Origins Platform', url: '/', type: 'tool', platform: 'origins' }
      ],
      practical_exercise: 'Write your personal collecting manifesto and trading rules.',
      origins_feature_integration: 'Use all Origins tools as part of your system.'
    },
    {
      lesson_number: 19,
      title: 'Case Studies: Learning from the Community',
      description: 'Study real collecting success stories.',
      content: `# Lesson 19: Case Studies - Learning from Success

Great collectors share common patterns.

## Success Stories
The best collectors:
- Start with a clear vision
- Educate themselves thoroughly
- Build diverse portfolios
- Play long games
- Adapt to changing markets
- Give back to community

## What NOT to Do
- Don't chase hype blindly
- Avoid over-leverage
- Don't neglect documentation
- Never ignore red flags
- Don't let emotions drive decisions

## Your Story
You're now ready to write your own success story.`,
      key_takeaways: [
        'Study successful collector strategies',
        'Most success comes from patience and planning',
        'Emotional discipline is critical',
        'Document lessons learned'
      ],
      learning_resources: [
        { title: 'Leaderboard', url: '#/leaderboard', type: 'guide', platform: 'origins' },
        { title: 'Top Collectors', url: '#/users', type: 'guide', platform: 'origins' }
      ],
      practical_exercise: 'Find 3 successful collectors and study their strategy.',
      origins_feature_integration: 'Learn from top collectors in the community.'
    },
    {
      lesson_number: 20,
      title: 'Mastery Complete: Your Next Steps',
      description: 'You\'ve completed the learning path. Here\'s what to do now.',
      content: `# Lesson 20: Mastery Complete - Your Next Steps

Congratulations! You've completed the comprehensive learning path.

## What You've Learned
- Card collecting fundamentals
- Grading and condition assessment
- Market analysis and trend spotting
- Portfolio management
- Risk management and diversification
- Community engagement
- Personal system building

## Your Next Steps
1. Start or expand your collection strategically
2. Use Origins tools to automate monitoring
3. Connect with other collectors
4. Execute your personal trading system
5. Review and adjust quarterly
6. Share your success and help others

## Stay Humble, Stay Learning
The best collectors never stop learning. Markets evolve, new cards emerge, and strategies need updating.

## Origins Mastery
You're now equipped to use every Origins feature effectively. Keep exploring!`,
      key_takeaways: [
        'You have the knowledge to collect successfully',
        'Implementation matters more than knowledge',
        'The community is your greatest resource',
        'Continuous improvement drives long-term success'
      ],
      learning_resources: [
        { title: 'Origins Help & Support', url: '#/support', type: 'guide', platform: 'origins' },
        { title: 'Community Forum', url: '#/feed', type: 'guide', platform: 'origins' }
      ],
      practical_exercise: 'Build your complete Origins collection and execute your first trades.',
      origins_feature_integration: 'Master all Origins features and tools.'
    }
  ];

  return lessons;
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

    // Create Sports Cards Master Plan
    const sportTypes = Object.values(SPORTS_CARDS_INFO);
    const sportLessons = generateProgressiveLessons('Sports Cards', sportTypes);
    
    const sportPlan = await base44.asServiceRole.entities.LearningPlan.create({
      name: 'Sports Cards Collector Mastery',
      description: 'Complete 20-lesson guide to sports card collecting: Baseball, Basketball, Football, Hockey, Soccer, Golf, UFC, and WWE.',
      card_interests: Object.keys(SPORTS_CARDS_INFO),
      use_case: 'collecting',
      category: 'sports_cards',
      lessons: sportLessons,
      total_lessons: 20,
      is_active: true
    });

    // Create TCG Master Plan
    const tcgTypes = Object.values(TCG_INFO);
    const tcgLessons = generateProgressiveLessons('Trading Card Games', tcgTypes);
    
    const tcgPlan = await base44.asServiceRole.entities.LearningPlan.create({
      name: 'Trading Card Games Mastery',
      description: 'Complete 20-lesson guide to TCGs: Pokémon, Magic: The Gathering, Yu-Gi-Oh!, One Piece, and Lorcana.',
      card_interests: Object.keys(TCG_INFO),
      use_case: 'collecting',
      category: 'tcg',
      lessons: tcgLessons,
      total_lessons: 20,
      is_active: true
    });

    return Response.json({
      success: true,
      sports_plan_id: sportPlan.id,
      sports_lessons_count: sportLessons.length,
      tcg_plan_id: tcgPlan.id,
      tcg_lessons_count: tcgLessons.length
    });
  } catch (error) {
    console.error('Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});