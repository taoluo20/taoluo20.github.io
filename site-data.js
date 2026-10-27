/* First-look content. Replace images, descriptions, reel URL and social links here. */
window.PORTFOLIO = {
  release: 'wip',
  name: 'Tao Luo',
  role: 'Visual effects & procedural art',
  email: 'taoluo20.p@gmail.com',
  reel: '',
  photogrammetry: [
    {
      id: 'fort-pulaski-cannon',
      title: 'Cannon',
      software: 'Polycam',
      sourceLabel: 'Polycam',
      location: 'Fort Pulaski National Monument',
      region: 'Cockspur Island, Georgia, United States',
      description: 'A cannon on a wooden platform, with a wheeled carriage and metal fittings. Captured at Fort Pulaski on Cockspur Island.',
      device: 'Apple iPhone 14 Pro',
      captureMethod: 'Guided object mode',
      capturedAt: '2026-05-08T10:50:00',
      capturedLabel: '8 May 2026, 10:50 AM',
      frames: 1414,
      vertices: '127.4K',
      captureUrl: 'https://poly.cam/capture/010E7813-1883-4BDC-A25F-72C572D66C97',
      embedUrl: 'https://poly.cam/capture/010E7813-1883-4BDC-A25F-72C572D66C97/embed'
    },
    {
      id: 'fort-pulaski-cannon-realityscan',
      title: 'Cannon',
      software: 'RealityScan',
      sourceLabel: 'Sketchfab',
      location: 'Fort Pulaski National Monument',
      region: 'Cockspur Island, Georgia, United States',
      description: 'A cannon at Fort Pulaski, reconstructed from 1,325 photographs in RealityScan.',
      publishedAt: '2026-05-09',
      publishedLabel: '9 May 2026',
      images: 1325,
      processingTime: '31 min 40 sec',
      triangles: '2.7M',
      vertices: '1.3M',
      uploadSize: '93.5 MB',
      textures: 1,
      materials: 1,
      captureUrl: 'https://sketchfab.com/3d-models/cannon-fort-pulaski-sav-d9ad4c2b4d5e4e94ba9e9f7af51fec62',
      embedUrl: 'https://sketchfab.com/models/d9ad4c2b4d5e4e94ba9e9f7af51fec62/embed?autostart=1'
    },
    {
      id: 'fort-pulaski-mortar',
      title: 'Mortar',
      software: 'RealityScan',
      sourceLabel: 'Sketchfab',
      location: 'Fort Pulaski National Monument',
      region: 'Cockspur Island, Georgia, United States',
      description: 'A mortar at Fort Pulaski, reconstructed from 33 photographs in RealityScan.',
      publishedAt: '2026-05-12',
      publishedLabel: '12 May 2026',
      images: 33,
      processingTime: '3 min 8 sec',
      triangles: '2.6M',
      vertices: '1.3M',
      uploadSize: '139.1 MB',
      textures: 1,
      materials: 1,
      captureUrl: 'https://sketchfab.com/3d-models/mortar-fort-pulaski-sav-b3294de8c3ba40e3a68044693fea2747',
      embedUrl: 'https://sketchfab.com/models/b3294de8c3ba40e3a68044693fea2747/embed?autostart=1'
    },
    {
      id: 'bskt-rs-02',
      title: 'BSKT_RS_02',
      software: 'RealityScan',
      sourceLabel: 'Sketchfab',
      description: 'Reconstructed from 110 photographs in RealityScan.',
      device: 'Apple iPhone 14 Pro',
      publishedAt: '2026-04-07',
      publishedLabel: '7 Apr 2026',
      images: 110,
      processingTime: '5 min 8 sec',
      triangles: '2.6M',
      vertices: '1.3M',
      uploadSize: '149.5 MB',
      textures: 1,
      materials: 1,
      captureUrl: 'https://sketchfab.com/3d-models/bskt-rs-02-66b5653d01aa4688a3e369f09c50cc3e',
      embedUrl: 'https://sketchfab.com/models/66b5653d01aa4688a3e369f09c50cc3e/embed?autostart=1'
    },
    {
      id: 'plants-box',
      title: 'Plants Box',
      software: 'RealityScan',
      sourceLabel: 'Sketchfab',
      description: 'A planted wooden box, reconstructed from 215 photographs in RealityScan.',
      publishedAt: '2026-05-19',
      publishedLabel: '19 May 2026',
      images: 215,
      processingTime: '5 min 17 sec',
      triangles: '1.3M',
      vertices: '632.4K',
      uploadSize: '76.7 MB',
      textures: 1,
      materials: 1,
      captureUrl: 'https://sketchfab.com/3d-models/plants-box-308c3fdc33ab4093a0387d550129345b',
      embedUrl: 'https://sketchfab.com/models/308c3fdc33ab4093a0387d550129345b/embed?autostart=1'
    }
  ],
  socials: [
    { id: 'artstation', name: 'ArtStation', url: 'https://www.artstation.com/taoluo' },
    { id: 'linkedin', name: 'LinkedIn', url: 'https://www.linkedin.com/in/taoluo20/' },
    { id: 'gmail', name: 'Gmail', url: '' },
    { id: 'github', name: 'GitHub', url: 'https://github.com/taoluo20' },
    { id: 'instagram', name: 'Instagram', url: 'https://www.instagram.com/tao_luo_art/' }
  ],
  projects: [
    {
      id: 'tidal', title: 'Tidal', type: 'FX / Water', image: 'ocean.jpg', secondary: 'coast.jpg',
      tags: ['Houdini', 'FLIP', 'Karma'], category: 'simulation',
      summary: 'An exploration of water, movement, and the feeling of scale.',
      description: 'A place for the finished shot, followed by the decisions that brought it to life. This first-look project uses reference photography to preview the layout. Final renders, simulation passes, and a breakdown video will live here.',
      focus: 'Motion & scale', color: '#689aab'
    },
    {
      id: 'ember', title: 'Ember', type: 'FX / Atmosphere', image: 'volcano.jpg', secondary: 'desert.jpg',
      tags: ['Houdini', 'Pyro', 'Nuke'], category: 'simulation',
      summary: 'Heat, atmosphere, and the quiet energy of a changing landscape.',
      description: 'A visual study of light and atmosphere. This sample page demonstrates how a final image, FX passes, and compositing notes can sit together in a single project story. The imagery is temporary reference photography.',
      focus: 'Light & atmosphere', color: '#d3865d'
    },
    {
      id: 'wildwood', title: 'Wildwood', type: 'Environment / Procedural', image: 'forest.jpg', secondary: 'landscape.jpg',
      tags: ['Houdini', 'Unreal Engine', 'PCG'], category: 'procedural',
      summary: 'A small world built from repetition, variation, and light.',
      description: 'This preview is a home for an environment breakdown: the final composition, procedural systems, asset variations, and the details that make a scene feel lived in. Current images are placeholders for the finished work.',
      focus: 'Systems & composition', color: '#729c81'
    },
    {
      id: 'strata', title: 'Strata', type: 'Terrain / Procedural', image: 'landscape.jpg', secondary: 'mountain.jpg',
      tags: ['Houdini', 'Heightfields', 'Unreal Engine'], category: 'procedural',
      summary: 'Reading the landscape through erosion, shape, and distance.',
      description: 'A project layout for terrain experiments and procedural landscapes. Show the final result first, then explore the terrain layers, masks, and art direction. Reference photography stands in for project renders in this version.',
      focus: 'Form & terrain', color: '#a0a577'
    },
    {
      id: 'chromatic', title: 'Chromatic', type: 'Look development / R&D', image: 'abstract.jpg', secondary: 'architecture.jpg',
      tags: ['Substance Designer', 'Houdini', 'Lookdev'], category: 'lookdev',
      summary: 'Color and surface, somewhere between the familiar and the abstract.',
      description: 'A flexible space for material studies, shader experiments, and smaller discoveries. This sample uses abstract photography to establish the presentation; authored materials and process images can replace it without changing the page structure.',
      focus: 'Color & surface', color: '#c3a0b9'
    },
    {
      id: 'highland', title: 'Highland', type: 'Environment / Lighting', image: 'mountain.jpg', secondary: 'mist.jpg',
      tags: ['Unreal Engine', 'Lighting', 'Worldbuilding'], category: 'lookdev',
      summary: 'An open horizon. A study in depth, light, and stillness.',
      description: 'A quiet environment study, presented with room for both the overall composition and its smallest details. This first version contains reference imagery so the spacing, project navigation, and full-screen interaction can be reviewed.',
      focus: 'Depth & lighting', color: '#9ab3c6'
    }
  ],
  photographs: [
    { image: 'city.jpg', title: 'Between the buildings', category: 'Street', alt: 'Evening light between tall city buildings' },
    { image: 'coast.jpg', title: 'The edge of the day', category: 'Nature', alt: 'A quiet beach at sunset' },
    { image: 'architecture.jpg', title: 'Lines in the light', category: 'Architecture', alt: 'Angular modern architecture against a bright sky' },
    { image: 'desert.jpg', title: 'Slow time', category: 'Nature', alt: 'Warm sunlight on a desert landscape' },
    { image: 'forest.jpg', title: 'A little further in', category: 'Nature', alt: 'Soft light through a dense green forest' },
    { image: 'mist.jpg', title: 'Somewhere quiet', category: 'Nature', alt: 'A mountain valley with trees and a meadow' }
  ],
  blog: { defaultCategory: 'scad' },
  posts: [
    {
      id: 'magic-crystal-overload',
      title: 'Magic Crystal Overload',
      category: 'SCAD',
      image: 'blog-wip.svg',
      excerpt: 'A project journal. Notes, experiments, and progress — coming soon.',
      // One card is a project; entries become numbered post cards in reading order.
      entries: [
        {
          id: 'post-001',
          aliases: ['introduction'],
          image: 'blog-wip.svg',
          blocks: []
        },
        {
          id: 'post-002',
          image: 'blog-wip.svg',
          blocks: []
        }
      ]
    }
  ]
};
