export interface NewsItem {
  id: number;
  title: string;
  summary: string;
  link: string;
  publishedAt: string;
  category: string;
  breaking?: boolean;
  coordinates?: string;
}
