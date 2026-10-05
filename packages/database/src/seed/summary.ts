import { CUSTOMER_APP_URL } from './constants';
import type { FloorContext } from './floor';
import type { IdentityContext } from './identity';
import type { OrdersContext } from './orders';

export const printSeedSummary = (id: IdentityContext, floor: FloorContext, orders: OrdersContext) => {
  console.log('\n================================================================================');
  console.log('🎉 TAVONZA DATABASE SEED COMPLETE');
  console.log('================================================================================\n');

  console.log('🏢 BRANCH:');
  console.log(`   ID:   ${id.branchId}`);
  console.log('   Name: Downtown HQ\n');

  console.log('🔐 ROLE CREDENTIALS (Password for all accounts: <Role>@1234):');
  console.log('┌──────────────────┬─────────────────────────┬──────────────────────┬─────────────────────────┐');
  console.log('│ Role             │ Name                    │ Email                │ Scope / Assignment      │');
  console.log('├──────────────────┼─────────────────────────┼──────────────────────┼─────────────────────────┤');
  console.log('│ Branch Manager   │ Marcus Vance            │ manager@tavonza.ai   │ All Tables & Operations │');
  console.log('│ Waiter (Lead)    │ David Chen              │ waiter@tavonza.ai    │ Tables T-01 to T-06     │');
  console.log('│ Waiter           │ Sara Ahmed              │ sara@tavonza.ai      │ Tables T-07 to T-10     │');
  console.log('│ Waiter           │ Mike Rossi              │ mike@tavonza.ai      │ Table T-11              │');
  console.log('│ Waiter           │ Mello Park              │ mello@tavonza.ai     │ On Duty (Reassignable)  │');
  console.log('│ Cashier          │ Emma Watson             │ cashier@tavonza.ai   │ Billing & Settlements   │');
  console.log('│ Kitchen Staff    │ Chef Gordon             │ kitchen@tavonza.ai   │ KDS Cooking Queue       │');
  console.log('│ Customer         │ Sarah Jenkins           │ customer@tavonza.ai  │ 120 Loyalty Points      │');
  console.log('│ Customer 2       │ Jordan Lee              │ guest2@tavonza.ai    │ Split-Bill Guest        │');
  console.log('│ System Admin     │ Platform Owner          │ owner@tavonza.ai     │ Super Admin             │');
  console.log('└──────────────────┴─────────────────────────┴──────────────────────┴─────────────────────────┘\n');

  console.log('🪑 FLOOR TABLES & SCENARIOS:');
  console.log('┌───────┬──────────┬──────────────────┬──────────────┬─────────────┬────────────────────────────────────┐');
  console.log('│ Table │ Capacity │ Status           │ Waiter       │ Order #     │ Test Scenario                      │');
  console.log('├───────┼──────────┼──────────────────┼──────────────┼─────────────┼────────────────────────────────────┤');
  for (const [label, t] of Object.entries(floor)) {
    const waiterName = t.waiter?.name || 'Unassigned';
    const ordKey = Object.values(orders).find((o) => o.tableLabel === label)?.orderNumber || '-';
    console.log(
      `│ ${label.padEnd(5)} │ ${String(t.serviceStatus).padEnd(8).slice(0, 8)} │ ${t.serviceStatus.padEnd(16)} │ ${waiterName.padEnd(12).slice(0, 12)} │ ${ordKey.padEnd(11)} │ ` +
      (label === 'T-01' ? 'PENDING order approval              ' :
       label === 'T-02' ? 'Clean AVAILABLE table for QR scan   ' :
       label === 'T-03' ? 'Mixed stations prep (Grill/Cold/Bar)' :
       label === 'T-04' ? 'Bill requested / READY to serve     ' :
       label === 'T-05' ? 'Dining SERVED                       ' :
       label === 'T-06' ? 'ORDERING active session (no order)  ' :
       label === 'T-07' ? 'Late prep ("Need Attention" 45m)    ' :
       label === 'T-08' ? 'RESERVED for tonight                ' :
       label === 'T-09' ? 'PARTIALLY_PAID split bill           ' :
       label === 'T-10' ? 'CLEANING flag                       ' :
       label === 'T-11' ? 'REJECTED + resubmitted order        ' :
       'OUT_OF_SERVICE                      ') + '│'
    );
  }
  console.log('└───────┴──────────┴──────────────────┴──────────────┴─────────────┴────────────────────────────────────┘\n');

  console.log('📱 CUSTOMER TEST URLS:');
  console.log(`   • Fresh QR Scan (T-02):    ${CUSTOMER_APP_URL}/scan?table=T-02`);
  console.log(`   • Direct Menu (T-02):      ${CUSTOMER_APP_URL}/menu?table=T-02`);
  console.log(`   • Active Table (T-01):     ${CUSTOMER_APP_URL}/menu?table=T-01`);
  console.log(`   • Order Tracking:          ${CUSTOMER_APP_URL}/orders/track?table=T-01&order=ORD-1001`);
  console.log(`   • Split-Bill Table (T-09): ${CUSTOMER_APP_URL}/checkout/split?table=T-09`);
  console.log('\n================================================================================\n');
};
