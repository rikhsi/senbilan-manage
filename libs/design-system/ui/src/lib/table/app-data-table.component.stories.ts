import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import { AppDataTableComponent } from './app-data-table.component';
import { type ColumnDef, type DataTableLabels } from './data-table.types';

type Row = {
  id: string;
  name: string;
  email: string;
  status: string;
};

const rows: readonly Row[] = [
  { id: '1', name: 'Ada Lovelace', email: 'ada@example.com', status: 'Active' },
  { id: '2', name: 'Grace Hopper', email: 'grace@example.com', status: 'Invited' },
  { id: '3', name: 'Alan Turing', email: 'alan@example.com', status: 'Disabled' },
];

const columns: readonly ColumnDef<Row>[] = [
  { key: 'name', header: 'Name', accessor: (r) => r.name, sortable: true, cardPriority: 1 },
  { key: 'email', header: 'Email', accessor: (r) => r.email, sortable: true, cardPriority: 2 },
  { key: 'status', header: 'Status', accessor: (r) => r.status, cardPriority: 3 },
];

const labels: DataTableLabels = {
  selectAll: 'Select all',
  selectRow: 'Select row',
  sortBy: 'Sort by',
  actions: 'Actions',
  expand: 'Expand',
  collapse: 'Collapse',
  retry: 'Retry',
  emptyTitle: 'No rows',
  emptyDescription: 'Nothing to show.',
  errorTitle: 'Failed to load',
  selectedCount: (count) => `${count} selected`,
  clearSelection: 'Clear',
  columns: 'Columns',
  resizeColumn: 'Resize column',
};

const meta: Meta = {
  title: 'Data/DataTable',
  decorators: [
    moduleMetadata({
      imports: [AppDataTableComponent],
    }),
  ],
  parameters: { layout: 'padded' },
};

export default meta;

type Story = StoryObj;

export const Basic: Story = {
  render: () => ({
    props: {
      rows,
      columns,
      labels,
      rowId: (row: Row) => row.id,
    },
    template: `
      <app-data-table
        style="width:min(56rem,100%)"
        [rows]="rows"
        [columns]="columns"
        [rowId]="rowId"
        [labels]="labels"
        [clientSort]="true"
        mode="table"
      />
    `,
  }),
};

export const Loading: Story = {
  render: () => ({
    props: {
      rows: [] as Row[],
      columns,
      labels,
      rowId: (row: Row) => row.id,
    },
    template: `
      <app-data-table
        style="width:min(56rem,100%)"
        [rows]="rows"
        [columns]="columns"
        [rowId]="rowId"
        [labels]="labels"
        [loading]="true"
        mode="table"
      />
    `,
  }),
};

export const Empty: Story = {
  render: () => ({
    props: {
      rows: [] as Row[],
      columns,
      labels,
      rowId: (row: Row) => row.id,
    },
    template: `
      <app-data-table
        style="width:min(56rem,100%)"
        [rows]="rows"
        [columns]="columns"
        [rowId]="rowId"
        [labels]="labels"
        mode="table"
      />
    `,
  }),
};
