export type DrinkType = 'water' | 'chaas';
export type GoalHours = 16 | 24 | 48 | 72;

export type Drink = { ts: number; type: DrinkType };

export type Fast = {
  id: string;
  startTime: number; // epoch ms — user can backdate
  goalHours: GoalHours;
  endTime?: number; // set when ended
  drinks: Drink[];
};

export type WeightEntry = { ts: number; kg: number };
