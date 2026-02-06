export interface Image {
  quality: string;
  url: string;
  link?: string; // Some endpoints return link instead of url
}

export interface DownloadUrl {
  quality: string;
  url: string;
}

export interface ArtistMini {
  id: string;
  name: string;
  role: string;
  type: string;
  image: Image[];
  url: string;
}

export interface Song {
  id: string;
  name: string;
  type: string;
  year?: string | null;
  releaseDate?: string | null;
  duration?: number | null;
  label?: string | null;
  explicitContent: boolean;
  playCount?: number | null;
  language: string;
  hasLyrics: boolean;
  lyricsId?: string | null;
  url: string;
  copyright?: string | null;
  album: {
    id: string | null;
    name: string | null;
    url: string | null;
  };
  artists: {
    primary: ArtistMini[];
    featured: ArtistMini[];
    all: ArtistMini[];
  };
  image: Image[];
  downloadUrl: DownloadUrl[];
  fetchedAt?: number;
}

export interface Album {
  id: string;
  title: string;
  name?: string;
  image: Image[];
  artist: string;
  url: string;
  type: string;
  description: string;
  year: string;
  language: string;
  songIds: string;
}


export interface SearchResult {
  albums: {
    results: Album[];
    position: number;
  };
  songs: {
    results: Song[];
    position: number;
  };
  artists: {
    results: Artist[];
    position: number;
  };
  playlists: {
    results: Playlist[];
    position: number;
  };
  topQuery: {
    results: (Song | Album | Artist | Playlist)[];
    position: number;
  };
}

export interface SearchResponse {
  success: boolean;
  data: SearchResult;
}

export interface SongSearchResponse {
  success: boolean;
  data: {
    total: number;
    start: number;
    results: Song[];
  };
}

export interface Artist {
  id: string;
  name: string;
  title?: string;
  role: string;
  type: string;
  image: Image[];
  url: string;
  followerCount?: number | string;
  isVerified?: boolean;
  dominantLanguage?: string;
  dominantType?: string;
  bio?: string[];
  dob?: string | null;
  fb?: string | null;
  twitter?: string | null;
  wiki?: string | null;
  availableLanguages?: string[];
  isRadioPresent?: boolean;
  topSongs?: Song[];
  topAlbums?: Album[];
  singles?: Album[];
  similarArtists?: Artist[];
}

export interface Playlist {
  id: string;
  title: string;
  subtitle?: string;
  type: string;
  image: Image[];
  url: string;
  songCount?: number | string;
  firstname?: string;
  followerCount?: string;
  lastUpdated?: string;
  explicitContent?: string | boolean;
}

export interface AlbumDetails extends Album {
  songs: Song[];
  artists: {
    primary: Artist[];
    featured: Artist[];
    all: Artist[];
  };
}

export interface PlaylistDetails extends Playlist {
  songs: Song[];
  artists?: Artist[];
}
