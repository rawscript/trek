

export type PayoutMethod = 'bank' | 'paypal' | 'stripe';

export interface BasePayoutDetails {
  method: PayoutMethod;
}

export interface BankPayoutDetails extends BasePayoutDetails {
  method: 'bank';
  accountHolderName: string;
  accountNumber: string;
  routingNumber: string;
}

export interface PayPalPayoutDetails extends BasePayoutDetails {
  method: 'paypal';
  email: string;
}

export interface StripePayoutDetails extends BasePayoutDetails {
    method: 'stripe';
    accountId: string; // e.g., acct_...
}

export type PayoutDetails = BankPayoutDetails | PayPalPayoutDetails | StripePayoutDetails;


export interface User {
  id: string;
  name: string;
  avatarUrl: string;
  isOnboardingCompleted?: boolean;
  payoutDetails?: PayoutDetails;
}

export type NavItem = 'Home' | 'Map' | 'Activity' | 'Social' | 'Chat';
export type ScreenName = NavItem | 'FundraiserList' | 'CreateFundraiser' | 'FundraiserDetail' | 'Notifications' | 'Settings';

export type UnitSystem = 'metric' | 'imperial';
export type Theme = 'light' | 'dark';

export interface Preferences {
  unitSystem: UnitSystem;
  theme: Theme;
}


export interface Coords {
  latitude: number;
  longitude: number;
}

export interface Activity {
  id: string;
  user: User;
  type: 'Cycle' | 'Run';
  distance: number; // in km
  time: string; // e.g., "1h 25m"
  duration: number; // in seconds
  imageUrl: string;
  route: {
    start: string;
    end: string;
  };
  timestamp: string;
  trekPath?: Coords[];
  heartRateData?: number[];
  aiInsight?: string;
}

export interface ChatMessage {
    role: 'user' | 'model';
    text: string;
}

export interface ConnectedDevice {
  id: string;
  name: string;
}

export interface Supporter {
  id: string;
  name: string;
  avatarUrl: string;
  amount: number;
  message?: string;
}

export interface Fundraiser {
  id:string;
  creator: User;
  title: string;
  description: string;
  goal: number;
  currentAmount: number;
  supporters: Supporter[];
  timestamp: string;
  imageUrl: string;
}

export interface Notification {
    id: string;
    userId: string;
    title: string;
    body: string;
    timestamp: string;
    read: boolean;
    fundraiserId?: string;
}

export type AmenityType = 'water' | 'bike_shop' | 'restroom';

export interface Amenity {
  id: string;
  name: string;
  type: AmenityType;
  coords: Coords;
}

// Widen JSX to allow for the spline-viewer custom element
declare global {
    namespace JSX {
        interface IntrinsicElements {
            'spline-viewer': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & { url: string }, HTMLElement>;
        }
    }
}
