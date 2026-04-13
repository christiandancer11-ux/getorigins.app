const LOGOS = [
  { name: 'Topps',              url: 'https://media.legacyApi.com/images/public/69ceb0c6913655f4b9105f84/2b518bef1_topps.png' },
  { name: 'Panini',             url: 'https://media.legacyApi.com/images/public/69ceb0c6913655f4b9105f84/029af84a9_panini.png' },
  { name: 'Fanatics',           url: 'https://media.legacyApi.com/images/public/69ceb0c6913655f4b9105f84/21e9a119b_fanatics.png' },
  { name: 'Upper Deck',         url: 'https://media.legacyApi.com/images/public/69ceb0c6913655f4b9105f84/6826a0110_upper_deck.png' },
  { name: 'Leaf',               url: 'https://media.legacyApi.com/images/public/69ceb0c6913655f4b9105f84/5f190d727_leaf.png' },
  { name: 'Pokémon TCG',        url: 'https://media.legacyApi.com/images/public/69ceb0c6913655f4b9105f84/1019ad6e3_pokemon_tcg.png' },
  { name: 'Wizards of the Coast',url: 'https://media.legacyApi.com/images/public/69ceb0c6913655f4b9105f84/fa491c53d_wizards_of_the_coast.png' },
  { name: 'Konami',             url: 'https://media.legacyApi.com/images/public/69ceb0c6913655f4b9105f84/b704d0e09_konami.png' },
  { name: 'Bandai',             url: 'https://media.legacyApi.com/images/public/69ceb0c6913655f4b9105f84/833d52395_bandai.png' },
];

export default function BrandLogos() {
  return (
    <div className="py-8 border-t border-border/30">
      <p className="text-center text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-6">
        Supports cards from
      </p>
      <div className="flex flex-wrap justify-center items-center gap-6">
        {LOGOS.map(logo => (
          <img
            key={logo.name}
            src={logo.url}
            alt={logo.name}
            title={logo.name}
            className="h-7 w-auto object-contain opacity-60 hover:opacity-100 transition-opacity duration-200 grayscale hover:grayscale-0"
          />
        ))}
      </div>
    </div>
  );
}
