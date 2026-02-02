import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useFavorites } from '../context/FavoritesContext';
import { getCategoryColor, type CategoryColorKey } from '../utils/categoryColors';

interface TermCardProps {
  id?: string; // Optional ID if this card interacts with the DB
  title: string;
  category: string;
  categoryColor?: CategoryColorKey;
  description: string;
  icon: string;
  to?: string;
  date?: string;
  isFavorite?: boolean; // Override state
}

export const TermCard: React.FC<TermCardProps> = ({ 
  id,
  title, 
  category, 
  categoryColor = 'primary', 
  description, 
  icon, 
  to, 
  date,
  isFavorite: propFavorite
}) => {
  const { themeMode } = useTheme();
  const { isFavorite, toggleFavorite } = useFavorites();

  const isLight = themeMode === 'light';
  const colorScheme = getCategoryColor(categoryColor || 'primary');
  const colors = isLight ? colorScheme.light : colorScheme.dark;

  // Use prop favorite if defined (for static display), otherwise check ID in context
  const favorited = propFavorite !== undefined ? propFavorite : (id ? isFavorite(id) : false);

  const iconContainerClasses = isLight
    ? `p-3.5 rounded-full border shadow-inner transition-all duration-300 group-hover:scale-110 ${colors.bg} ${colors.text} ${colors.border} group-hover:border-primary group-hover:bg-primary/10 group-hover:shadow-[0_0_15px_-5px_rgba(var(--color-primary),0.3)]`
    : `p-3.5 rounded-full border shadow-inner transition-all duration-300 group-hover:scale-110 ${colors.bg} ${colors.border} ${colors.text}`;

  const heartActiveColor = isLight ? 'text-primary drop-shadow-[0_0_8px_rgba(var(--color-primary),0.5)]' : 'text-rose-500';
  const heartHoverColor = isLight ? 'hover:text-primary' : 'hover:text-rose-500';
  
  // Default link logic if not provided
  const linkTarget = to || (id ? `/term/${id}` : '#');

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Only toggle if we have an ID to track
    if (id) {
       // Construct a basic TermData object for the favorite list
       toggleFavorite({
           id,
           term: title,
           fullTerm: title,
           category,
           definition: description,
           phonetic: '', // Partial data for list view
           translation: '',
           examples: [],
           analogies: [],
           practicalUsage: { title: '', content: '' },
           relatedTerms: []
       });
    }
  };

  const content = (
    <div className={`glass-card p-6 rounded-2xl flex flex-col h-full group cursor-pointer relative transition-all duration-300 ${isLight ? 'hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5' : ''}`}>
      <div className={`absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${isLight ? 'text-primary' : colors.text}`}>
         <span className="material-symbols-outlined">arrow_outward</span>
      </div>

      <div className="flex justify-between items-start mb-5">
        <div className={iconContainerClasses}>
          <span className="material-symbols-outlined text-3xl">{icon}</span>
        </div>
        <span className={`text-[10px] uppercase font-bold tracking-wider py-1 px-2.5 rounded-lg border transition-all duration-300 group-hover:opacity-0 ${colors.badge} ${isLight ? '' : colors.border}`}>
          {category}
        </span>
      </div>
      
      <div className="mb-6 flex-1">
        <h3 className={`text-xl font-bold text-slate-100 mb-2 font-display ${colors.hoverText} transition-colors`}>{title}</h3>
        <p className="text-sm text-slate-400 leading-relaxed line-clamp-3">{description}</p>
      </div>

      <div className="pt-4 border-t border-night-border flex items-center justify-between text-slate-500 text-xs mt-auto">
        {date ? (
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-sm">schedule</span>
            <span>{date}</span>
          </div>
        ) : (
          <div className="h-5"></div>
        )}
        
        <button
          type="button"
          onClick={handleFavoriteClick}
          aria-label={favorited ? "Remover dos favoritos" : "Adicionar aos favoritos"}
          title={favorited ? "Remover dos favoritos" : "Adicionar aos favoritos"}
          className={`flex items-center justify-center transition-colors z-20 ${heartHoverColor}`}
        >
          <span className={`material-symbols-outlined text-lg ${favorited ? `icon-filled ${heartActiveColor}` : 'text-slate-400'}`} aria-hidden="true">
            favorite
          </span>
        </button>
      </div>
    </div>
  );

  return <Link to={linkTarget} className="h-full block rounded-2xl transition-all" style={{ borderRadius: '1rem' }}>{content}</Link>;
};