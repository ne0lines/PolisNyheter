export interface PoliceLocation {
  name: string;
  gps?: string;
}

export type EventType = "Incident" | "Trafik" | "Arbetsplatsolycka" | "Annat";

export interface PoliceEvent {
  id: number;
  datetime: string;
  name: string;
  summary: string;
  url: string;
  type: EventType;
  location: PoliceLocation;
  breaking?: boolean;
}
