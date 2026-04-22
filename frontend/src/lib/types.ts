export type Role = 'CLIENT' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  role: Role;
}

export interface Travel {
  id: string;
  title: string;
  description: string;
  destination: string;
  price: string | number;
  startDate: string;
  endDate: string;
  capacity: number;
  imageUrl?: string | null;
  active: boolean;
  createdAt?: string;
  feedbacks?: Feedback[];
}

export type ReservationStatus = 'PENDING' | 'CONFIRMED' | 'REJECTED' | 'CANCELLED';

export interface Reservation {
  id: string;
  userId: string;
  travelId: string;
  seats: number;
  totalPrice: string | number;
  status: ReservationStatus;
  createdAt: string;
  travel?: Travel;
  user?: User;
  feedback?: Feedback | null;
}

export type FeedbackStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface Feedback {
  id: string;
  userId: string;
  travelId: string;
  reservationId: string;
  rating: number;
  comment: string;
  status: FeedbackStatus;
  createdAt: string;
  user?: { firstName: string; lastName: string; email?: string };
  travel?: { id: string; title: string };
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface PaginatedTravels {
  items: Travel[];
  total: number;
  page: number;
  pageSize: number;
}

export interface DashboardKpis {
  users: number;
  clients: number;
  admins: number;
  travels: number;
  activeTravels: number;
  reservations: { total: number; confirmed: number; pending: number };
  revenue: number;
  daily: { date: string; bookings: number; revenue: number }[];
  topDestinations: { id: string; title: string; destination: string; bookings: number }[];
}
