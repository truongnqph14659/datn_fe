import {useEffect, useRef} from 'react';

type PerformanceMonitorProps = {
  componentName: string;
};

export const usePerformanceMonitor = ({componentName}: PerformanceMonitorProps) => {
  const renderCount = useRef(0);
  const startTime = useRef<number>(performance.now());

  renderCount.current++;

  useEffect(() => {
    const endTime = performance.now();
    const duration = endTime - startTime.current;

    console.log(`[${componentName}] ⚡ Render #${renderCount.current}`);
    console.log(`[${componentName}] ⏱️ Render took ${duration.toFixed(2)}ms`);

    startTime.current = performance.now(); // Reset for next render
  });
};
