/**
 * UNIVERSAL CROSS-SELL COMPONENT
 * CR AudioViz AI - Henderson Standard
 * 
 * Embeddable component that shows contextual product recommendations
 * across all apps in the ecosystem.
 */

'use client';

import React, { useEffect, useState } from 'react';
import { ArrowRight, Sparkles, Star } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description: string;
  icon: string;
  url: string;
  category: string;
  tags: string[];
  rating?: number;
  isFree?: boolean;
  isNew?: boolean;
}

const PRODUCTS: Product[] = [
  {
    id: 'javari',
    name: 'Javari AI',
    description: 'Your intelligent AI assistant for everything',
    icon: '🤖',
    url: 'https://javariai.com',
    category: 'ai',
    tags: ['ai', 'assistant', 'chat'],
    rating: 4.9,
    isNew: true
  },
  {
    id: 'market-oracle',
    name: 'Market Oracle',
    description: 'AI-powered stock analysis and predictions',
    icon: '📈',
    url: 'https://crav-market-oracle.vercel.app',
    category: 'finance',
    tags: ['stocks', 'investing', 'ai', 'analysis'],
    rating: 4.8
  },
  {
    id: 'pdf-builder',
    name: 'PDF Builder Pro',
    description: 'Create professional PDFs in seconds',
    icon: '📄',
    url: 'https://crav-pdf-builder.vercel.app',
    category: 'productivity',
    tags: ['pdf', 'documents', 'business'],
    rating: 4.7,
    isFree: true
  },
  {
    id: 'invoice-generator',
    name: 'Invoice Generator',
    description: 'Professional invoices for your business',
    icon: '💰',
    url: 'https://crav-invoice-generator.vercel.app',
    category: 'business',
    tags: ['invoices', 'business', 'billing'],
    rating: 4.8
  },
  {
    id: 'logo-studio',
    name: 'Logo Studio',
    description: 'AI-powered logo design in minutes',
    icon: '🎨',
    url: 'https://crav-logo-studio.vercel.app',
    category: 'design',
    tags: ['logo', 'design', 'branding', 'ai']
  },
  {
    id: 'social-graphics',
    name: 'Social Graphics',
    description: 'Stunning social media visuals',
    icon: '📱',
    url: 'https://crav-social-graphics.vercel.app',
    category: 'marketing',
    tags: ['social', 'marketing', 'graphics']
  },
  {
    id: 'ebook-creator',
    name: 'eBook Creator',
    description: 'Write and publish eBooks easily',
    icon: '📚',
    url: 'https://crav-ebook-creator.vercel.app',
    category: 'publishing',
    tags: ['ebook', 'writing', 'publishing']
  },
  {
    id: 'scrapbook',
    name: 'Digital Scrapbook',
    description: 'Beautiful memory keeping',
    icon: '🖼️',
    url: 'https://crav-scrapbook.vercel.app',
    category: 'creative',
    tags: ['photos', 'memories', 'creative']
  },
  {
    id: 'cravbarrels',
    name: 'CravBarrels',
    description: 'Track your bourbon collection',
    icon: '🥃',
    url: 'https://cravbarrels.com',
    category: 'lifestyle',
    tags: ['bourbon', 'whiskey', 'collection']
  },
  {
    id: 'cardverse',
    name: 'CardVerse',
    description: 'Trading card marketplace',
    icon: '🃏',
    url: 'https://cravcards.com',
    category: 'marketplace',
    tags: ['cards', 'trading', 'collectibles']
  },
  {
    id: 'orlando-deals',
    name: 'Orlando Trip Deal',
    description: 'Best Orlando vacation deals',
    icon: '🏰',
    url: 'https://orlandotripdeal.com',
    category: 'travel',
    tags: ['travel', 'disney', 'orlando', 'vacation']
  },
  {
    id: 'games',
    name: 'CravGames Hub',
    description: '1,200+ free games to play',
    icon: '🎮',
    url: 'https://cravgameshub.com',
    category: 'entertainment',
    tags: ['games', 'free', 'entertainment'],
    isFree: true
  }
];

interface CrossSellProps {
  currentApp?: string;
  category?: string;
  tags?: string[];
  maxItems?: number;
  variant?: 'horizontal' | 'vertical' | 'compact' | 'banner';
  className?: string;
}

export function CrossSell({
  currentApp,
  category,
  tags = [],
  maxItems = 3,
  variant = 'horizontal',
  className = ''
}: CrossSellProps) {
  const [recommendations, setRecommendations] = useState<Product[]>([]);

  useEffect(() => {
    // Filter out current app
    let filtered = PRODUCTS.filter(p => p.id !== currentApp);

    // Score products based on relevance
    const scored = filtered.map(product => {
      let score = 0;
      
      // Category match
      if (category && product.category === category) score += 3;
      
      // Tag matches
      tags.forEach(tag => {
        if (product.tags.includes(tag)) score += 2;
      });
      
      // Boost new products
      if (product.isNew) score += 1;
      
      // Boost highly rated
      if (product.rating && product.rating >= 4.8) score += 1;
      
      return { ...product, score };
    });

    // Sort by score and take top items
    const sorted = scored.sort((a, b) => b.score - a.score);
    setRecommendations(sorted.slice(0, maxItems));
  }, [currentApp, category, tags, maxItems]);

  if (recommendations.length === 0) return null;

  if (variant === 'banner') {
    return (
      <div className={`bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-lg ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5" />
            <span className="font-medium">Try our other tools:</span>
          </div>
          <div className="flex gap-4">
            {recommendations.map(product => (
              <a
                key={product.id}
                href={product.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:underline"
              >
                <span>{product.icon}</span>
                <span>{product.name}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={`space-y-2 ${className}`}>
        <p className="text-sm text-gray-500 font-medium">You might also like</p>
        {recommendations.map(product => (
          <a
            key={product.id}
            href={product.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm hover:text-blue-600 transition-colors"
          >
            <span>{product.icon}</span>
            <span>{product.name}</span>
            {product.isNew && (
              <span className="px-1.5 py-0.5 bg-green-100 text-green-700 text-xs rounded">NEW</span>
            )}
          </a>
        ))}
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-yellow-500" />
        You might also like
      </h3>
      <div className={`grid gap-4 ${variant === 'vertical' ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-3'}`}>
        {recommendations.map(product => (
          <a
            key={product.id}
            href={product.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group block p-4 bg-white border rounded-xl hover:shadow-lg hover:border-blue-300 transition-all"
          >
            <div className="flex items-start gap-3">
              <span className="text-3xl">{product.icon}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold group-hover:text-blue-600 transition-colors">
                    {product.name}
                  </h4>
                  {product.isNew && (
                    <span className="px-1.5 py-0.5 bg-green-100 text-green-700 text-xs rounded font-medium">
                      NEW
                    </span>
                  )}
                  {product.isFree && (
                    <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-xs rounded font-medium">
                      FREE
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-1">{product.description}</p>
                {product.rating && (
                  <div className="flex items-center gap-1 mt-2 text-sm text-gray-500">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span>{product.rating}</span>
                  </div>
                )}
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

export default CrossSell;
