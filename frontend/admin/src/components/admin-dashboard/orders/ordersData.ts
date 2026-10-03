import { OrderRow } from './types';

export const initialOrdersList: OrderRow[] = [
  { id: '#10482', table: 'T-08', customer: 'Emma Wilson', items: '04', server: 'Jake R.', time: '2:14 PM', status: 'Preparing', total: '$48.50' },
  { id: '#10481', table: 'T-03', customer: 'Liam Johnson', items: '02', server: 'Jake R.', time: '2:10 PM', status: 'Ready', total: '$32.00' },
  { id: '#10480', table: 'T-11', customer: 'Sophia Brown', items: '06', server: 'Sarah M.', time: '2:05 PM', status: 'Served', total: '$84.20' },
  { id: '#10479', table: 'T-02', customer: 'Lucas Davis', items: '03', server: 'Jake R.', time: '1:58 PM', status: 'Completed', total: '$45.00' },
  { id: '#10478', table: 'T-07', customer: 'Olivia Miller', items: '05', server: 'Sarah M.', time: '1:54 PM', status: 'Pending', total: '$62.50' },
  { id: '#10477', table: 'T-15', customer: 'Noah Garcia', items: '02', server: 'Alex T.', time: '1:49 PM', status: 'Cancelled', total: '$28.00' },
  { id: '#10476', table: 'T-14', customer: 'Ava Martinez', items: '03', server: 'Jake R.', time: '1:45 PM', status: 'Completed', total: '$53.50' },
  { id: '#10475', table: 'T-09', customer: 'Ethan Taylor', items: '04', server: 'Alex T.', time: '1:40 PM', status: 'Completed', total: '$41.00' },
  { id: '#10474', table: 'T-01', customer: 'Isabella Anderson', items: '02', server: 'Sarah M.', time: '1:35 PM', status: 'Completed', total: '$29.50' },
  { id: '#10473', table: 'T-12', customer: 'Mason Thomas', items: '07', server: 'Alex T.', time: '1:30 PM', status: 'Completed', total: '$96.00' },
  { id: '#10472', table: 'T-06', customer: 'Mia Jackson', items: '03', server: 'Jake R.', time: '1:25 PM', status: 'Preparing', total: '$38.50' },
  { id: '#10471', table: 'T-10', customer: 'James White', items: '01', server: 'Sarah M.', time: '1:20 PM', status: 'Pending', total: '$18.00' },
  { id: '#10470', table: 'T-05', customer: 'Charlotte Harris', items: '05', server: 'Jake R.', time: '1:15 PM', status: 'Completed', total: '$72.50' },
  { id: '#10469', table: 'T-14', customer: 'Benjamin Clark', items: '02', server: 'Alex T.', time: '1:10 PM', status: 'Cancelled', total: '$24.00' },
  { id: '#10468', table: 'T-13', customer: 'Amelia Lewis', items: '04', server: 'Sarah M.', time: '1:05 PM', status: 'Completed', total: '$55.00' },
];

export const orderStatusFilterOptions = [
  'All',
  'Pending',
  'Preparing',
  'Ready',
  'Served',
  'Completed',
  'Cancelled',
] as const;
