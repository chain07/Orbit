import React, { useContext, useEffect, useRef } from 'react';
import { render } from '@testing-library/react';
import { StorageProvider, StorageContext } from './StorageContext';

// Mock localStorage
const mockSetItem = jest.fn();
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: jest.fn(() => null),
    setItem: mockSetItem,
    removeItem: jest.fn(),
  },
  writable: true,
});

const Consumer = ({ onRender }) => {
  const { addMetric } = useContext(StorageContext);
  onRender();
  return null;
};

describe('StorageContext Performance', () => {
  it('should not re-render consumers when provider re-renders but state is unchanged', () => {
    const renderCount = jest.fn();

    const Wrapper = ({ trigger }) => (
      <StorageProvider>
        <Consumer onRender={renderCount} />
        <div data-trigger={trigger} />
      </StorageProvider>
    );

    const { rerender } = render(<Wrapper trigger={1} />);
    expect(renderCount).toHaveBeenCalledTimes(1);

    // Re-render parent with new prop, StorageProvider re-renders
    rerender(<Wrapper trigger={2} />);

    // Since value is memoized, consumer should NOT re-render
    expect(renderCount).toHaveBeenCalledTimes(1);
  });

  it('should debounce localStorage writes', async () => {
    jest.useFakeTimers();
    mockSetItem.mockClear();

    const TestComponent = () => {
      const { addLogEntry } = useContext(StorageContext);
      useEffect(() => {
        // Simulate rapid updates
        addLogEntry({ metricId: 'test1', value: 1, timestamp: Date.now() });
        addLogEntry({ metricId: 'test1', value: 2, timestamp: Date.now() });
        addLogEntry({ metricId: 'test1', value: 3, timestamp: Date.now() });
      }, [addLogEntry]);
      return null;
    };

    render(
      <StorageProvider>
        <TestComponent />
      </StorageProvider>
    );

    // Writes should be debounced
    expect(mockSetItem).not.toHaveBeenCalled();

    // Fast-forward time
    jest.runAllTimers();

    // Should be called once
    expect(mockSetItem).toHaveBeenCalledTimes(1);

    jest.useRealTimers();
  });
});
