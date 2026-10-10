export interface DistributionZone {
  id: string;
  name: string;
  description?: string | null;
  substations?: Substation[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateZonePayload {
  name: string;
  description?: string;
}

export interface UpdateZonePayload {
  name?: string;
  description?: string;
}

export interface Substation {
  id: string;
  name: string;
  zoneId: string;
  zone?: {
    id: string;
    name: string;
  } | null;
  feeders?: Feeder[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateSubstationPayload {
  name: string;
  zoneId: string;
}

export interface UpdateSubstationPayload {
  name?: string;
  zoneId?: string;
}

export interface Feeder {
  id: string;
  name: string;
  substationId: string;
  substation?: {
    id: string;
    name: string;
    zoneId?: string;
  } | null;
  areas?: Area[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateFeederPayload {
  name: string;
  substationId: string;
}

export interface UpdateFeederPayload {
  name?: string;
  substationId?: string;
}

export interface Area {
  id: string;
  name: string;
  feederId: string;
  feeder?: {
    id: string;
    name: string;
    substation?: {
      id: string;
      name: string;
      zone?: {
        id: string;
        name: string;
      } | null;
    } | null;
  } | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAreaPayload {
  name: string;
  feederId: string;
}

export interface UpdateAreaPayload {
  name?: string;
  feederId?: string;
}
