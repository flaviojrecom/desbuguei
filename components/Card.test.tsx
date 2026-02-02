import { describe, it, expect } from 'vitest';
import { render, screen } from '../test-utils';
import { TermCard } from './Card';

describe('TermCard Component', () => {
  const defaultProps = {
    id: 'test-id',
    title: 'API',
    category: 'Desenvolvimento',
    categoryColor: 'primary' as const,
    description: 'Test description for API term',
    icon: 'library_books',
  };

  it('should render term card with title and description', () => {
    render(<TermCard {...defaultProps} />);

    expect(screen.getByText('API')).toBeInTheDocument();
    expect(screen.getByText('Test description for API term')).toBeInTheDocument();
  });

  it('should render category badge', () => {
    render(<TermCard {...defaultProps} />);

    expect(screen.getByText('Desenvolvimento')).toBeInTheDocument();
  });

  it('should render icon', () => {
    render(<TermCard {...defaultProps} />);

    const icon = screen.getByText('library_books');
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveClass('material-symbols-outlined');
  });

  it('should display date when provided', () => {
    render(<TermCard {...defaultProps} date="Hoje às 10:30" />);

    expect(screen.getByText('Hoje às 10:30')).toBeInTheDocument();
  });

  it('should have link to term detail page by default', () => {
    render(<TermCard {...defaultProps} />);

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/term/test-id');
  });

  it('should use custom link when provided', () => {
    render(<TermCard {...defaultProps} to="/custom-path" />);

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/custom-path');
  });

  it('should render favorite button', () => {
    render(<TermCard {...defaultProps} />);

    const favoriteButton = screen.getByTitle('Adicionar aos favoritos');
    expect(favoriteButton).toBeInTheDocument();
  });

  it('should handle different color categories', () => {
    const categories = ['primary', 'purple', 'emerald', 'orange', 'rose', 'blue'] as const;

    categories.forEach(color => {
      const { unmount } = render(
        <TermCard {...defaultProps} categoryColor={color} />
      );
      expect(screen.getByText('API')).toBeInTheDocument();
      unmount();
    });
  });

  it('should mark card as favorite when isFavorite prop is true', () => {
    render(<TermCard {...defaultProps} isFavorite={true} />);

    const favoriteButton = screen.getByTitle('Remover dos favoritos');
    expect(favoriteButton).toBeInTheDocument();
    const favoriteIcon = favoriteButton.querySelector('span');
    expect(favoriteIcon).toHaveClass('icon-filled');
  });

  it('should have proper accessibility attributes', () => {
    render(<TermCard {...defaultProps} />);

    const link = screen.getByRole('link');
    expect(link).toHaveClass('h-full', 'block');

    const title = screen.getByText('API');
    expect(title).toHaveClass('text-xl', 'font-bold');
  });
});
