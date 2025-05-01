import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

// A simple component to test
const ExampleComponent = ({ title }: { title: string }) => {
  return <div data-testid="example-component"><h1>{title}</h1></div>;
};

describe('ExampleComponent', () => {
  it('renders with the correct title', () => {
    render(<ExampleComponent title="Hello, Vitest!" />);
    
    const component = screen.getByTestId('example-component');
    expect(component).toBeDefined();
    expect(component.textContent).toBe('Hello, Vitest!');
  });
});
