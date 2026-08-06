import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import { QuickActionsWidget } from '../components/BentoWidgets';

describe('BentoWidgets Integration Tests', () => {
  it('renders quick action shortcut buttons with testIDs and handles presses', async () => {
    const onScanReceipt = jest.fn();
    const onAddTransaction = jest.fn();
    const onAddTask = jest.fn();

    const { getByTestId } = await render(
      <QuickActionsWidget
        onScanReceipt={onScanReceipt}
        onAddTransaction={onAddTransaction}
        onAddTask={onAddTask}
      />
    );

    const btnScan = getByTestId('btn-scan-receipt');
    const btnTx = getByTestId('btn-open-add-tx');
    const btnTask = getByTestId('btn-open-add-task');

    expect(btnScan).toBeTruthy();
    expect(btnTx).toBeTruthy();
    expect(btnTask).toBeTruthy();

    await act(async () => {
      fireEvent.press(btnScan);
    });
    expect(onScanReceipt).toHaveBeenCalledTimes(1);

    await act(async () => {
      fireEvent.press(btnTx);
    });
    expect(onAddTransaction).toHaveBeenCalledTimes(1);

    await act(async () => {
      fireEvent.press(btnTask);
    });
    expect(onAddTask).toHaveBeenCalledTimes(1);
  });
});
