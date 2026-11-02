export interface TabThemePreset {
  id: string;
  name: string;
  tagline: string;
  coverImage: string;
  accent: string;
}

export const TAB_PRESETS: TabThemePreset[] = [
  {
    id: 'travel-friends',
    name: 'Travel & Expeditions',
    tagline: 'Mountain trips, road trips & weekend getaways',
    coverImage: '/assets/aistudio/file_00000000374881f5983b64890efd45c2_4b6a22b6.png',
    accent: '#F5A623',
  },
  {
    id: 'dining-cocktails',
    name: 'Dining & Drinks',
    tagline: 'Shared dinners, brunches & night outs',
    coverImage: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
    accent: '#E59900',
  },
  {
    id: 'cabin-retreat',
    name: 'Cabin & Retreat',
    tagline: 'Ski chalets, beach houses & Airbnb rentals',
    coverImage: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80',
    accent: '#10B981',
  },
  {
    id: 'city-loft',
    name: 'Co-Living & Rent',
    tagline: 'Apartment rent, utilities & household goods',
    coverImage: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80',
    accent: '#6366F1',
  },
  {
    id: 'adventures-events',
    name: 'Adventures & Passes',
    tagline: 'Ski passes, concert tickets & festivals',
    coverImage: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80',
    accent: '#EC4899',
  },
];

export const CATEGORY_PHOTO_FALLBACKS: Record<string, string> = {
  stay: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=400&q=80',
  food: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=400&q=80',
  groceries: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80',
  transport: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=400&q=80',
  activities: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=400&q=80',
  drinks: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=400&q=80',
  other: '/assets/aistudio/file_00000000374881f5983b64890efd45c2_4b6a22b6.png',
};
