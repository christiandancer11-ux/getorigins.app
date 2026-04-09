import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const generateCollectorLessons = (category) => [
  {
    lesson_number: 1,
    title: 'What Are Trading Cards?',
    description: 'Learn the basics of card collecting!',
    slides: [
      {
        icon: '🎴',
        title: 'What Are Trading Cards?',
        content: 'Trading cards are special collectible cards with pictures and information on them. People collect them, trade them, and sometimes sell them!',
        points: [
          'Each card is unique and special',
          'Some cards are super rare and valuable',
          'You can collect them as a hobby',
          'Trading with friends is fun!'
        ]
      },
      {
        icon: '⭐',
        title: 'Why Are Cards Valuable?',
        content: 'Some cards are worth lots of money! Let\'s learn what makes a card special.',
        points: [
          'Rare cards are harder to find',
          'Popular players or characters are worth more',
          'Cards in perfect condition cost more',
          'Old cards are usually more valuable'
        ]
      },
      {
        icon: '🎁',
        title: 'Starting Your Collection',
        content: 'You can start collecting cards today! It\'s fun and exciting.',
        points: [
          'Start with cards you really like',
          'Don\'t worry about being expensive at first',
          'Buy from local card shops or online',
          'Join a community of collectors!'
        ]
      },
      {
        icon: '📚',
        title: 'Why Collectors Love Cards',
        content: 'Millions of people collect cards. Here\'s why it\'s awesome!',
        points: [
          'It\'s fun to search for rare cards',
          'You can trade with friends',
          'Cards can become valuable',
          'It\'s like being on a treasure hunt!'
        ]
      }
    ]
  },
  {
    lesson_number: 2,
    title: `Types of ${category}`,
    description: `Learn about different ${category.toLowerCase()} and their features!`,
    slides: [
      {
        icon: '🎪',
        title: `Types of ${category}`,
        content: `There are many different ${category.toLowerCase()}! Let's explore them.`,
        points: ['Each type is unique', 'Some are easier to collect than others', 'All can be valuable']
      },
      {
        icon: category === 'Sports Cards' ? '⚾' : '🔴',
        title: category === 'Sports Cards' ? 'Baseball Cards' : 'Pokémon Cards',
        content: category === 'Sports Cards' ? 'Baseball cards feature players from baseball teams. Famous rookies can be worth lots of money!' : 'Pokémon cards are super popular! Gotta catch \'em all, and some are worth thousands!',
        points: category === 'Sports Cards' ? ['Great for new collectors', 'Easy to find at card shops', 'Fun to learn about players'] : ['Most popular TCG worldwide', 'Lots of different sets to collect', 'Very fun to play the game']
      },
      {
        icon: category === 'Sports Cards' ? '🏀' : '✨',
        title: category === 'Sports Cards' ? 'Basketball Cards' : 'Magic: The Gathering',
        content: category === 'Sports Cards' ? 'Basketball cards show NBA stars. Some cards are super shiny and rare!' : 'Magic cards are collectible and playable. Old cards can be VERY valuable!',
        points: category === 'Sports Cards' ? ['Modern cards are popular', 'Easy to start collecting', 'Lots of cool variations'] : ['Games are fun and strategic', 'Rare cards worth big money', 'Huge collector community']
      },
      {
        icon: category === 'Sports Cards' ? '🏈' : '⚡',
        title: category === 'Sports Cards' ? 'Football Cards' : 'Yu-Gi-Oh! Cards',
        content: category === 'Sports Cards' ? 'Football cards show NFL players. Rookie cards can be very valuable!' : 'Yu-Gi-Oh! cards are about dueling. Rare cards are super hard to find!',
        points: category === 'Sports Cards' ? ['Great for sports fans', 'Cards change value with player success', 'Fun to trade with friends'] : ['Great competitive game', 'Lots of rare cards', 'Active player community']
      },
      {
        icon: category === 'Sports Cards' ? '🏒' : '🏴‍☠️',
        title: category === 'Sports Cards' ? 'Hockey Cards' : 'One Piece Cards',
        content: category === 'Sports Cards' ? 'Hockey cards feature NHL stars. Some vintage cards are worth a lot!' : 'One Piece cards feature characters from the anime. Growing in popularity!',
        points: category === 'Sports Cards' ? ['Popular worldwide', 'Lots of history in hockey cards', 'Great investment potential'] : ['New and exciting', 'Great for anime fans', 'Prices still increasing']
      },
      {
        icon: '🤔',
        title: 'Which Should You Collect?',
        content: 'Choose the one you like best! There\'s no wrong choice.',
        points: [
          'Pick your favorite sport or character',
          'Start small and learn',
          'Have fun with it!',
          'You can always collect more types later'
        ]
      }
    ]
  },
  {
    lesson_number: 3,
    title: 'Card Rarity & Value',
    description: 'Learn why some cards cost more than others!',
    slides: [
      {
        icon: '💎',
        title: 'What Makes Cards Valuable?',
        content: 'Not all cards are worth the same! Some are super valuable.',
        points: [
          'Rare cards = more valuable',
          'Popular players/characters = higher price',
          'Perfect condition = costs more',
          'Old cards = usually more expensive'
        ]
      },
      {
        icon: '🌟',
        title: 'The Rarity Scale',
        content: 'Cards have different rarity levels. Higher rarity = higher price!',
        points: [
          'Common: $0.10-$1 (Easy to find)',
          'Uncommon: $1-$5 (Harder to find)',
          'Rare: $5-$50 (Very hard to find)',
          'Ultra Rare: $50-$500 (Extremely hard)',
          '1 of 1: $500+ (One in the world!)'
        ]
      },
      {
        icon: '🔍',
        title: 'How to Spot Value',
        content: 'Look at these things to tell if a card might be valuable!',
        points: [
          'Is it a popular player or character?',
          'Is it from a long time ago?',
          'Does it have special effects (shiny, holographic)?',
          'Is it in perfect condition?'
        ]
      }
    ]
  },
  {
    lesson_number: 4,
    title: 'Building Your Collection',
    description: 'Create a smart collecting strategy!',
    slides: [
      {
        icon: '🎯',
        title: 'Pick Your Focus',
        content: 'Great collectors focus on one thing. Pick what YOU love!',
        points: [
          'Collect one favorite player or character',
          'Collect complete sets',
          'Collect a specific year or era',
          'Collect cards in perfect condition'
        ]
      },
      {
        icon: '💰',
        title: 'Set a Budget',
        content: 'Know how much money you want to spend each week or month.',
        points: [
          'Start small - maybe $5-10 per week',
          'Quality beats quantity',
          'Don\'t spend money you need for other things',
          'Save up for special cards'
        ]
      },
      {
        icon: '🛍️',
        title: 'Where to Buy',
        content: 'There are lots of places to find cards!',
        points: [
          'Local card shops are great',
          'Online stores have huge selection',
          'Card shows and events are fun',
          'Trade with friends'
        ]
      },
      {
        icon: '📝',
        title: 'Organize Your Collection',
        content: 'Keep your cards safe and organized!',
        points: [
          'Use card sleeves to protect them',
          'Store in binders or boxes',
          'Keep a list of what you have',
          'Take pictures for your records'
        ]
      }
    ]
  },
  {
    lesson_number: 5,
    title: 'Taking Care of Your Cards',
    description: 'Protect your investment!',
    slides: [
      {
        icon: '🛡️',
        title: 'Why Cards Need Care',
        content: 'Damaged cards lose value. Let\'s learn how to protect them!',
        points: [
          'Bent cards are worth less',
          'Stains and creases hurt value',
          'Good condition = more money',
          'Your future self will thank you!'
        ]
      },
      {
        icon: '✨',
        title: 'Condition Matters',
        content: 'The better condition = the more valuable!',
        points: [
          'Perfect: Looks brand new - MOST valuable',
          'Near Perfect: Tiny bit of wear',
          'Very Good: Light wear but nice',
          'Good: Noticeable wear',
          'Poor: Lots of damage - low value'
        ]
      },
      {
        icon: '🏠',
        title: 'Storage Tips',
        content: 'Keep your cards safe at home!',
        points: [
          'Use protective sleeves for each card',
          'Keep in a cool, dry place',
          'Store away from sunlight',
          'Keep away from water and pets'
        ]
      }
    ]
  },
  {
    lesson_number: 6,
    title: 'Reading Card Values',
    description: 'Learn how to check if a card is valuable!',
    slides: [
      {
        icon: '📊',
        title: 'How to Check Card Prices',
        content: 'You can look up how much any card is worth!',
        points: [
          'Websites show recent sales',
          'Compare prices on different sites',
          'More rare = usually more expensive',
          'Check past sales, not just asking prices'
        ]
      },
      {
        icon: '🔍',
        title: 'Using Price Guides',
        content: 'Price guides help you understand card values.',
        points: [
          'Look at sold prices (not asking prices)',
          'Check multiple sources',
          'Condition affects price a lot',
          'Prices change over time'
        ]
      },
      {
        icon: '💡',
        title: 'Smart Shopping',
        content: 'Be smart when buying cards!',
        points: [
          'Never buy the first one you see',
          'Compare prices first',
          'Watch for good deals',
          'Build relationships with sellers'
        ]
      }
    ]
  },
  {
    lesson_number: 7,
    title: 'Spotting Fakes',
    description: 'Learn to identify counterfeit cards!',
    slides: [
      {
        icon: '⚠️',
        title: 'Fake Cards Exist!',
        content: 'Some people make fake cards. We need to avoid them!',
        points: [
          'Fake cards hurt the hobby',
          'They\'re worth nothing',
          'They\'re illegal to sell',
          'Smart collectors spot them'
        ]
      },
      {
        icon: '🔎',
        title: 'How to Spot Fakes',
        content: 'Look at these things to spot fake cards:',
        points: [
          'Check printing quality - is it crisp?',
          'Feel the card - does it feel right?',
          'Check corners - are they sharp?',
          'Look for hologram/security features'
        ]
      },
      {
        icon: '✅',
        title: 'Stay Safe',
        content: 'Here\'s how to avoid fake cards:',
        points: [
          'Buy from trusted sellers',
          'Ask lots of questions',
          'Request high-quality photos',
          'When in doubt, skip it!'
        ]
      }
    ]
  },
  {
    lesson_number: 8,
    title: 'Grading & Certification',
    description: 'Learn about professional grading!',
    slides: [
      {
        icon: '🏆',
        title: 'What is Grading?',
        content: 'Experts can officially rate how good your card is!',
        points: [
          'Grading companies are experts',
          'They rate cards on a scale of 1-10',
          'Graded cards get put in protective cases',
          'Grading increases value for some cards'
        ]
      },
      {
        icon: '⭐',
        title: 'The Grading Scale',
        content: 'Cards are graded from 1 (poor) to 10 (perfect)!',
        points: [
          '10 - Gem Mint: Perfect card',
          '9 - Mint: Nearly perfect',
          '8 - Near Mint: Light wear',
          '7 - Very Good: More wear',
          '6 or below: Lower grades'
        ]
      },
      {
        icon: '🤔',
        title: 'Should You Grade?',
        content: 'Grading costs money. Only do it for valuable cards!',
        points: [
          'Grading costs $25-150 per card',
          'Only grade if card might be worth $500+',
          'It protects valuable cards',
          'Graded cards are easier to sell'
        ]
      }
    ]
  },
  {
    lesson_number: 9,
    title: 'Trading With Friends',
    description: 'Learn to trade fairly and have fun!',
    slides: [
      {
        icon: '🤝',
        title: 'Trading is Fun!',
        content: 'Trading cards with friends is awesome!',
        points: [
          'It\'s how collecting started',
          'Fair trades make friendships stronger',
          'Everyone leaves happy',
          'You get new cards for your collection'
        ]
      },
      {
        icon: '⚖️',
        title: 'Fair Trading',
        content: 'Make trades where both people win!',
        points: [
          'Both cards should be similar value',
          'Check prices before trading',
          'No tricking friends',
          'Be honest about card condition'
        ]
      },
      {
        icon: '🎊',
        title: 'Trading Tips',
        content: 'Be a great trading partner!',
        points: [
          'Inspect cards together',
          'Take your time deciding',
          'Be excited for your friend',
          'Keep cards safe during trade'
        ]
      }
    ]
  },
  {
    lesson_number: 10,
    title: 'Seasonal Collecting',
    description: 'Learn when to buy and collect!',
    slides: [
      {
        icon: '📅',
        title: 'Prices Change Throughout the Year',
        content: 'Card prices go up and down! Smart collectors know when to buy.',
        points: [
          'New releases = high prices at first',
          'Prices cool down after a while',
          'Holidays = more people buying',
          'Best times to buy are often slowest times'
        ]
      },
      {
        icon: '🎄',
        title: 'Holiday & Event Cycles',
        content: 'Prices change with the seasons!',
        points: [
          'Christmas = LOTS of cards sold',
          'New Year = good time to start fresh',
          'Summer = slower for some cards',
          'Sports seasons change prices'
        ]
      },
      {
        icon: '💡',
        title: 'Smart Seasonal Buying',
        content: 'Use seasonality to your advantage!',
        points: [
          'Buy when fewer people are buying',
          'Prices drop after the hype',
          'Patience = better deals',
          'Plan ahead for what you want'
        ]
      }
    ]
  },
  {
    lesson_number: 11,
    title: 'The Collector Community',
    description: 'Join the collector family!',
    slides: [
      {
        icon: '👥',
        title: 'You\'re Not Alone!',
        content: 'Millions of people collect cards just like you!',
        points: [
          'There\'s a community everywhere',
          'People help each other',
          'Share tips and tricks',
          'Make new friends'
        ]
      },
      {
        icon: '🌍',
        title: 'Where to Find Collectors',
        content: 'Meet other collectors in lots of places!',
        points: [
          'Local card shops',
          'Card shows and events',
          'Online communities',
          'Social media groups'
        ]
      },
      {
        icon: '🤗',
        title: 'Be Part of the Community',
        content: 'Help others and make friends!',
        points: [
          'Share what you know',
          'Be kind to new collectors',
          'Help people learn',
          'Celebrate wins together'
        ]
      }
    ]
  },
  {
    lesson_number: 12,
    title: 'Setting Collection Goals',
    description: 'Create goals for your collection!',
    slides: [
      {
        icon: '🎯',
        title: 'What Do You Want?',
        content: 'Think about your collection goals!',
        points: [
          'Finish a complete set?',
          'Collect all cards of one player?',
          'Get all the rare cards?',
          'Build a collection worth money?'
        ]
      },
      {
        icon: '📈',
        title: 'Setting Smart Goals',
        content: 'Make goals that are fun AND possible!',
        points: [
          'Start small and build bigger',
          'Be realistic with your budget',
          'Track your progress',
          'Celebrate when you reach goals'
        ]
      },
      {
        icon: '🏆',
        title: 'Long-Term Collecting',
        content: 'The best collections take time!',
        points: [
          'Collect at your own pace',
          'Enjoy the journey',
          'Don\'t rush it',
          'Have fun every step!'
        ]
      }
    ]
  },
  {
    lesson_number: 13,
    title: 'Taking Photos & Sharing',
    description: 'Document and share your collection!',
    slides: [
      {
        icon: '📸',
        title: 'Why Take Photos?',
        content: 'Photos help you track and share your collection!',
        points: [
          'You remember what you have',
          'Show friends your awesome cards',
          'Track value over time',
          'Create memories'
        ]
      },
      {
        icon: '📱',
        title: 'Taking Great Card Photos',
        content: 'Good photos make cards look amazing!',
        points: [
          'Use good lighting',
          'Center the card in the photo',
          'Show both sides of the card',
          'Take close-ups of special details'
        ]
      },
      {
        icon: '✨',
        title: 'Sharing Your Collection',
        content: 'Share with the community!',
        points: [
          'Post on social media',
          'Show friends at school',
          'Write about your finds',
          'Inspire other collectors'
        ]
      }
    ]
  },
  {
    lesson_number: 14,
    title: 'Selling Your Cards',
    description: 'Learn how to sell cards fairly!',
    slides: [
      {
        icon: '💵',
        title: 'When to Sell?',
        content: 'You might want to sell cards sometimes. Here\'s how!',
        points: [
          'Duplicate cards you don\'t need',
          'Upgrade to a nicer copy',
          'Make money for new purchases',
          'Cards you no longer like'
        ]
      },
      {
        icon: '🏷️',
        title: 'Fair Pricing',
        content: 'Price your cards fairly!',
        points: [
          'Check what they sold for',
          'Match or slightly beat other prices',
          'Account for shipping costs',
          'Be honest about condition'
        ]
      },
      {
        icon: '🛍️',
        title: 'Where to Sell',
        content: 'Several options for selling cards:',
        points: [
          'Online platforms',
          'Local buyers',
          'Trade with friends',
          'Card shops'
        ]
      }
    ]
  },
  {
    lesson_number: 15,
    title: 'Your Collecting Journey',
    description: 'You\'re ready to collect!',
    slides: [
      {
        icon: '🎉',
        title: 'You\'ve Learned So Much!',
        content: 'You now know everything to start your awesome collection!',
        points: [
          'You understand card values',
          'You know how to find good deals',
          'You can protect your cards',
          'You\'re ready to start collecting!'
        ]
      },
      {
        icon: '🚀',
        title: 'Your Next Steps',
        content: 'Ready to start? Here\'s what to do:',
        points: [
          'Pick what you want to collect',
          'Set a budget',
          'Find a local card shop',
          'Buy your first cards'
        ]
      },
      {
        icon: '⭐',
        title: 'Have Fun!',
        content: 'Remember - collecting is supposed to be FUN!',
        points: [
          'Enjoy the search for rare cards',
          'Make collecting friends',
          'Be proud of your collection',
          'This is the beginning of your journey!'
        ]
      }
    ]
  }
];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Delete existing plans
    const existing = await base44.asServiceRole.entities.LearningPlan.list();
    for (const plan of existing) {
      await base44.asServiceRole.entities.LearningPlan.delete(plan.id);
    }

    // Create kid-friendly collector lessons
    const sportLessons = generateCollectorLessons('Sports Cards');
    const tcgLessons = generateCollectorLessons('Trading Card Games');

    const sportPlan = await base44.asServiceRole.entities.LearningPlan.create({
      name: 'Sports Cards Collecting 101',
      description: 'Learn how to collect sports cards the fun way!',
      card_interests: ['baseball', 'basketball', 'football', 'hockey'],
      use_case: 'collecting',
      category: 'sports_cards',
      lessons: sportLessons,
      total_lessons: sportLessons.length,
      is_active: true
    });

    const tcgPlan = await base44.asServiceRole.entities.LearningPlan.create({
      name: 'Trading Card Games 101',
      description: 'Learn how to collect TCGs the fun way!',
      card_interests: ['pokemon', 'magic_the_gathering', 'yugioh', 'one_piece'],
      use_case: 'collecting',
      category: 'tcg',
      lessons: tcgLessons,
      total_lessons: tcgLessons.length,
      is_active: true
    });

    return Response.json({
      success: true,
      plans: {
        sports: { id: sportPlan.id, lessons: sportLessons.length },
        tcg: { id: tcgPlan.id, lessons: tcgLessons.length }
      }
    });
  } catch (error) {
    console.error('Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});