'use client';

import { useState, useCallback, useMemo } from 'react';
import { Search, MapPin, Loader2, Zap, Clock, Star, TrendingDown, ArrowRight, Sparkles, Globe, ChevronDown, ArrowUpDown, Info, ShoppingCart, Plus, Heart, Bookmark, Bell } from 'lucide-react';
import { searchProducts, optimizeCart } from '@/lib/api';
import { SearchResponse, ProductGroup, ProductResult, CountryCode, COUNTRIES, PLATFORM_CONFIG, getCountryPlatforms, CartOptimizationResponse } from '@/types';
import Sidebar from '@/components/Sidebar';
import SectionView from '@/components/SectionView';
import CartPanel, { CartProduct } from '@/components/CartPanel';

type SortOption = 'relevance' | 'price_low' | 'price_high' | 'time_fast';

const SORT_OPTIONS: { value: SortOption; label: string; icon: string }[] = [
  { value: 'relevance', label: 'Relevance', icon: '✨' },
  { value: 'price_low', label: 'Price: Low to High', icon: '💰' },
  { value: 'price_high', label: 'Price: High to Low', icon: '💎' },
  { value: 'time_fast', label: 'Delivery: Fastest', icon: '⚡' },
];

// Sections that render as full inline pages (not popups)
const SECTION_PAGES = new Set([
  'coupons', 'oracle', 'carbon', 'reviews', 'campus', 'supplymap',
  'history', 'saved', 'cart', 'alerts', 'favourites',
]);

export default function Home() {
  const [result, setResult] = useState<SearchResponse | null>(null);
  const [cartResult, setCartResult] = useState<CartOptimizationResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [hoveredPriceId, setHoveredPriceId] = useState<string | null>(null);
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState<CountryCode>('IN');
  const [showCountryMenu, setShowCountryMenu] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('relevance');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [activeSection, setActiveSection] = useState('home');
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [cartItems, setCartItems] = useState<CartProduct[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [favorites, setFavorites] = useState<ProductResult[]>([]);
  const [savedGroups, setSavedGroups] = useState<ProductGroup[]>([]);
  const [priceAlerts, setPriceAlerts] = useState<ProductResult[]>([]);
  const [userResaleItems, setUserResaleItems] = useState<any[]>([]);
  const [activeChat, setActiveChat] = useState<{ seller: string; product: string } | null>(null);

  // Cart management functions
  const addToCart = useCallback((product: ProductResult) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1, addedAt: Date.now() }];
    });
    // Brief flash animation on the cart icon
    setCartOpen(true);
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setCartItems(prev => prev.filter(item => item.product.id !== productId));
  }, []);

  const updateCartQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      setCartItems(prev => prev.filter(item => item.product.id !== productId));
    } else {
      setCartItems(prev =>
        prev.map(item =>
          item.product.id === productId ? { ...item, quantity } : item
        )
      );
    }
  }, []);

  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  const totalCartItems = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0);
  }, [cartItems]);

  const isInCart = useCallback((productId: string) => {
    return cartItems.some(item => item.product.id === productId);
  }, [cartItems]);

  const toggleFavorite = useCallback((product: ProductResult) => {
    setFavorites(prev => {
      const isFav = prev.some(f => f.id === product.id);
      if (isFav) return prev.filter(f => f.id !== product.id);
      return [...prev, product];
    });
  }, []);

  const toggleSaveGroup = useCallback((group: ProductGroup) => {
    setSavedGroups(prev => {
      const isSaved = prev.some(g => g.group_id === group.group_id);
      if (isSaved) return prev.filter(g => g.group_id !== group.group_id);
      return [...prev, group];
    });
  }, []);

  const handleSellItem = useCallback((item: any) => {
    setUserResaleItems(prev => [item, ...prev]);
  }, []);

  const handleChatWithSeller = useCallback((seller: string, product: string) => {
    setActiveChat({ seller, product });
  }, []);

  const togglePriceAlert = useCallback((product: ProductResult) => {
    setPriceAlerts(prev => {
      const exists = prev.some(a => a.id === product.id);
      if (exists) return prev.filter(a => a.id !== product.id);
      return [...prev, product];
    });
  }, []);

  const handleOptimizeCart = useCallback(async () => {
    if (cartItems.length < 2) return;
    setLoading(true);
    setCartOpen(false);
    setResult(null);
    setCartResult(null);
    setActiveSection('search');

    try {
      // Use product titles as queries for optimization
      const queries = cartItems.map(item => item.product.title);
      const data = await optimizeCart(queries, postalCode, country);
      setCartResult(data);
    } catch (err) {
      console.error('Optimization failed:', err);
    } finally {
      setLoading(false);
    }
  }, [cartItems, postalCode, country]);

  const currentCountry = COUNTRIES[country];
  const platforms = getCountryPlatforms(country);

  // Whether we're showing a full-page section view
  const isShowingSection = SECTION_PAGES.has(activeSection);

  // Handle sidebar section clicks → navigate to inline view
  const handleSectionChange = useCallback((section: string) => {
    setActiveSection(section);
  }, []);

  // Handle clicking a search history item from the section view
  const handleSearch = useCallback(async (overriddenQuery?: string) => {
    const activeQuery = (overriddenQuery || query).trim();
    if (!activeQuery || !postalCode.trim()) return;

    setLoading(true);
    setResult(null);
    setCartResult(null);
    setActiveSection('search');

    try {
      // Force single product search as requested by user
      const data = await searchProducts(activeQuery, postalCode, country);
      setResult(data);

      // Track search history (unique, most recent first)
      setSearchHistory(prev => {
        const filtered = prev.filter(q => q !== activeQuery);
        return [activeQuery, ...filtered].slice(0, 10);
      });
    } catch {
      setResult(null);
      setCartResult(null);
    }
    setLoading(false);
  }, [query, postalCode, country]);

  const handleSearchRelatedFromCart = useCallback((searchTerm: string) => {
    setQuery(searchTerm);
    setCartOpen(false);
    handleSearch(searchTerm);
  }, [handleSearch]);

  const handleHistorySearch = useCallback((q: string) => {
    setQuery(q);
    handleSearch(q);
  }, [handleSearch]);

  // Sort product groups based on selected option
  const sortedProductGroups = useMemo(() => {
    if (!result?.product_groups) return [];

    // Clone groups to avoid mutating original data
    const groups = [...result.product_groups];

    // Sort the groups themselves
    switch (sortBy) {
      case 'price_low':
        return groups.sort((a, b) =>
          a.best_price.price_breakdown.total_landed_cost - b.best_price.price_breakdown.total_landed_cost
        );
      case 'price_high':
        return groups.sort((a, b) =>
          b.best_price.price_breakdown.total_landed_cost - a.best_price.price_breakdown.total_landed_cost
        );
      case 'time_fast':
        return groups.sort((a, b) =>
          a.fastest_delivery.eta_minutes - b.fastest_delivery.eta_minutes
        );
      case 'relevance':
      default:
        return groups.sort((a, b) => b.match_confidence - a.match_confidence);
    }
  }, [result?.product_groups, sortBy]);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #0a0a0f 0%, #000 100%)',
      color: '#fff',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    }}>
      {/* Sidebar */}
      <Sidebar
        isExpanded={sidebarExpanded}
        onToggle={() => setSidebarExpanded(!sidebarExpanded)}
        activeSection={activeSection}
        onSectionChange={handleSectionChange}
        hasResults={!!(result && result.product_groups.length > 0)}
        couponCount={result?.insights?.coupons?.total_coupons_found}
        searchHistory={searchHistory}
        systemHealth={result?.system_health}
        userPersona={result?.user_persona}
      />

      {/* Background Glow */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        background: 'radial-gradient(ellipse at 30% -10%, rgba(99, 102, 241, 0.08) 0%, transparent 50%), radial-gradient(ellipse at 70% 100%, rgba(6, 182, 212, 0.05) 0%, transparent 50%)',
        pointerEvents: 'none',
      }} />

      {/* Main Content - shifts right based on sidebar */}
      <div style={{
        position: 'relative',
        marginLeft: sidebarExpanded ? 240 : 72,
        transition: 'margin-left 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px 100px' }}>

          {/* SECTION VIEW (when a sidebar item is active) */}
          {isShowingSection ? (
            <SectionView
              section={activeSection}
              insights={result?.insights || null}
              symbol={result?.currency_symbol || currentCountry.symbol}
              query={result?.query || query}
              pincode={postalCode}
              searchHistory={searchHistory}
              onBack={() => setActiveSection(result ? 'search' : 'home')}
              onSearchHistoryClick={handleHistorySearch}
              userPersona={result?.user_persona}
              smartReorder={result?.smart_reorder}
              cartItems={cartItems}
              onRemoveFromCart={removeFromCart}
              onUpdateCartQuantity={updateCartQuantity}
              onOptimize={handleOptimizeCart}
              favorites={favorites}
              onToggleFavorite={toggleFavorite}
              savedGroups={savedGroups}
              onToggleSaveGroup={toggleSaveGroup}
              priceAlerts={priceAlerts}
              onTogglePriceAlert={togglePriceAlert}
              isLoading={loading}
              userResaleItems={userResaleItems}
              onSellItem={handleSellItem}
              activeChat={activeChat}
              onChatWithSeller={handleChatWithSeller}
              onCloseChat={() => setActiveChat(null)}
            />
          ) : (
            <>

              {/* Header */}
              <header style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: 32 }}>
                <div style={{ position: 'relative' }}>
                  <button
                    onClick={() => setShowCountryMenu(!showCountryMenu)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '10px 16px', background: '#111114', border: '1px solid #27272a',
                      borderRadius: 12, cursor: 'pointer', color: '#fff',
                    }}
                  >
                    <Globe size={18} color="#06b6d4" />
                    <span style={{ fontSize: 22 }}>{currentCountry.flag}</span>
                    <span style={{ fontSize: 14 }}>{currentCountry.name}</span>
                    <ChevronDown size={16} color="#71717a" />
                  </button>

                  {showCountryMenu && (
                    <div style={{
                      position: 'absolute', top: '100%', right: 0, marginTop: 8,
                      background: '#111114', border: '1px solid #27272a', borderRadius: 16,
                      overflow: 'hidden', zIndex: 100, minWidth: 220, maxHeight: 400, overflowY: 'auto',
                      boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
                    }}>
                      {(Object.entries(COUNTRIES) as [CountryCode, typeof COUNTRIES[CountryCode]][]).map(([code, c]) => (
                        <button
                          key={code}
                          onClick={() => { setCountry(code); setShowCountryMenu(false); setPostalCode(''); setResult(null); }}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 12, width: '100%',
                            padding: '14px 18px', background: country === code ? '#1f1f24' : 'transparent',
                            border: 'none', cursor: 'pointer', color: '#fff', textAlign: 'left',
                          }}
                        >
                          <span style={{ fontSize: 22 }}>{c.flag}</span>
                          <span style={{ fontSize: 14, flex: 1 }}>{c.name}</span>
                          <span style={{ fontSize: 13, color: '#52525b' }}>{c.symbol}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </header>

              {/* Hero */}
              <div style={{ textAlign: 'center', marginBottom: 40 }}>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  padding: '8px 18px', marginBottom: 20,
                  background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(6, 182, 212, 0.15))',
                  border: '1px solid rgba(99, 102, 241, 0.25)', borderRadius: 50,
                }}>
                  <Sparkles size={14} color="#818cf8" />
                  <span style={{ fontSize: 13, color: '#a5b4fc' }}>Compare prices across {platforms.length} apps in {currentCountry.name}</span>
                </div>

                <h1 style={{ fontSize: 44, fontWeight: 800, marginBottom: 14, letterSpacing: '-1px' }}>
                  Find the <span style={{ background: 'linear-gradient(135deg, #22c55e, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Best Deals</span> Instantly
                </h1>
                <p style={{ fontSize: 17, color: '#71717a' }}>Compare prices across grocery, food delivery & e-commerce apps</p>
              </div>

              {/* Platform Badges */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginBottom: 28, flexWrap: 'wrap' }}>
                {platforms.slice(0, 7).map(p => {
                  const config = PLATFORM_CONFIG[p];
                  if (!config) return null;
                  return (
                    <div key={p} style={{
                      display: 'flex', alignItems: 'center', gap: 10, padding: '10px 18px',
                      background: '#111114', border: '1px solid #27272a', borderRadius: 50,
                    }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: 8, overflow: 'hidden',
                        background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        border: `2px solid ${config.color}`,
                      }}>
                        <img
                          src={config.logoUrl}
                          alt={config.name}
                          style={{ width: 24, height: 24, objectFit: 'contain' }}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            if (target.parentElement) {
                              target.parentElement.style.background = config.color;
                              target.parentElement.innerHTML = `<span style="font-size:13px;font-weight:800;color:#fff">${config.shortName}</span>`;
                            }
                          }}
                        />
                      </div>
                      <span style={{ fontSize: 14, color: '#fff', fontWeight: 600 }}>{config.name}</span>
                    </div>
                  );
                })}
              </div>

              {/* Search Box */}
              <div style={{
                background: 'linear-gradient(180deg, #111114 0%, #0a0a0d 100%)',
                border: '1px solid #1f1f24', borderRadius: 24, padding: 28, marginBottom: 40,
                boxShadow: '0 25px 60px rgba(0,0,0,0.4)',
              }}>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
                    <Search size={20} style={{ position: 'absolute', left: 18, top: '50%', transform: 'translateY(-50%)', color: '#52525b' }} />
                    <input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                      placeholder="Search for products..."
                      style={{
                        width: '100%', background: '#050507', border: '2px solid #1f1f24', borderRadius: 14,
                        padding: '18px 18px 18px 52px', color: '#fff', fontSize: 15, outline: 'none',
                      }}
                    />
                  </div>
                  <div style={{ width: 150, position: 'relative' }}>
                    <MapPin size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#52525b' }} />
                    <input
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                      placeholder={currentCountry.postalPlaceholder}
                      style={{
                        width: '100%', background: '#050507', border: '2px solid #1f1f24', borderRadius: 14,
                        padding: '18px 18px 18px 46px', color: '#fff', fontSize: 15, outline: 'none',
                      }}
                    />
                  </div>
                  <button
                    id="search-button"
                    onClick={() => handleSearch()}
                    disabled={loading || !query.trim() || !postalCode.trim()}
                    style={{
                      background: 'linear-gradient(135deg, #6366f1, #06b6d4)', border: 'none', borderRadius: 14,
                      padding: '18px 36px', color: '#fff', fontSize: 15, fontWeight: 600, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: 10,
                      opacity: loading || !query.trim() || !postalCode.trim() ? 0.5 : 1,
                      boxShadow: '0 10px 30px rgba(99, 102, 241, 0.25)',
                    }}
                  >
                    {loading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
                    {loading ? 'Searching...' : 'Compare'}
                  </button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 20, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 13, color: '#52525b' }}>Popular:</span>
                  {['iPhone', 'AirPods', 'Charger', 'Laptop', 'Milk', 'Coffee', 'TV', 'Headphones'].map(tag => (
                    <button key={tag} onClick={() => setQuery(tag)} style={{
                      background: '#0e0e11', border: '1px solid #1f1f24', borderRadius: 50,
                      padding: '8px 16px', color: '#a1a1aa', fontSize: 13, cursor: 'pointer',
                    }}>{tag}</button>
                  ))}
                </div>
              </div>

              {/* Results */}
              {loading && !result ? (
                <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px 40px' }}>
                  {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
                </div>
              ) : cartResult ? (
                <CartResultsView data={cartResult} />
              ) : result ? (
                result.product_groups.length > 0 ? (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                        <p style={{ fontSize: 15, color: '#71717a' }}>
                          Found <span style={{ color: '#fff', fontWeight: 600 }}>{result.total_results}</span> results for{' '}
                          <span style={{ color: '#06b6d4', fontWeight: 600 }}>&quot;{result.query}&quot;</span>
                        </p>
                        {/* Live Data Verification Badge */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px', background: 'rgba(34, 197, 94, 0.08)', borderRadius: 20, border: '1px solid rgba(34, 197, 94, 0.2)' }}>
                          <style>{`@keyframes pulse { 0% { opacity: 1; transform: scale(1); box-shadow: 0 0 0 rgba(34, 197, 94, 0.4); } 50% { opacity: 0.6; transform: scale(0.95); box-shadow: 0 0 8px rgba(34, 197, 94, 0); } 100% { opacity: 1; transform: scale(1); box-shadow: 0 0 0 rgba(34, 197, 94, 0.4); } }`}</style>
                          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', animation: 'pulse 2s infinite ease-in-out' }}></div>
                          <span style={{ fontSize: 12, color: '#4ade80', fontWeight: 600, letterSpacing: 0.5 }}>
                            LIVE VERIFIED • {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            {result.location_name ? ` • ${result.location_name}` : ''}
                          </span>
                        </div>
                      </div>

                      {/* Sort Dropdown */}
                      <div style={{ position: 'relative' }}>
                        <button
                          onClick={() => setShowSortMenu(!showSortMenu)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 10,
                            padding: '12px 18px',
                            background: 'linear-gradient(135deg, #111114 0%, #0a0a0d 100%)',
                            border: '1px solid #27272a',
                            borderRadius: 12, cursor: 'pointer', color: '#fff',
                            transition: 'all 0.2s ease',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = '#3f3f46';
                            e.currentTarget.style.background = 'linear-gradient(135deg, #18181b 0%, #111114 100%)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = '#27272a';
                            e.currentTarget.style.background = 'linear-gradient(135deg, #111114 0%, #0a0a0d 100%)';
                          }}
                        >
                          <ArrowUpDown size={16} color="#06b6d4" />
                          <span style={{ fontSize: 14, color: '#a1a1aa' }}>Sort:</span>
                          <span style={{ fontSize: 14, fontWeight: 600 }}>
                            {SORT_OPTIONS.find(o => o.value === sortBy)?.icon} {SORT_OPTIONS.find(o => o.value === sortBy)?.label}
                          </span>
                          <ChevronDown size={16} color="#71717a" style={{
                            transform: showSortMenu ? 'rotate(180deg)' : 'rotate(0deg)',
                            transition: 'transform 0.2s ease'
                          }} />
                        </button>

                        {showSortMenu && (
                          <>
                            {/* Backdrop to close menu */}
                            <div
                              onClick={() => setShowSortMenu(false)}
                              style={{
                                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                                zIndex: 99,
                              }}
                            />
                            <div style={{
                              position: 'absolute', top: '100%', right: 0, marginTop: 8,
                              background: 'linear-gradient(180deg, #18181b 0%, #111114 100%)',
                              border: '1px solid #27272a', borderRadius: 16,
                              overflow: 'hidden', zIndex: 100, minWidth: 240,
                              boxShadow: '0 20px 60px rgba(0,0,0,0.6), 0 0 40px rgba(6, 182, 212, 0.1)',
                            }}>
                              {SORT_OPTIONS.map((option) => (
                                <button
                                  key={option.value}
                                  onClick={() => { setSortBy(option.value); setShowSortMenu(false); }}
                                  style={{
                                    display: 'flex', alignItems: 'center', gap: 12, width: '100%',
                                    padding: '14px 18px',
                                    background: sortBy === option.value
                                      ? 'linear-gradient(135deg, rgba(6, 182, 212, 0.15), rgba(99, 102, 241, 0.1))'
                                      : 'transparent',
                                    border: 'none', cursor: 'pointer', color: '#fff', textAlign: 'left',
                                    borderLeft: sortBy === option.value ? '3px solid #06b6d4' : '3px solid transparent',
                                    transition: 'all 0.15s ease',
                                  }}
                                  onMouseEnter={(e) => {
                                    if (sortBy !== option.value) {
                                      e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                                    }
                                  }}
                                  onMouseLeave={(e) => {
                                    if (sortBy !== option.value) {
                                      e.currentTarget.style.background = 'transparent';
                                    }
                                  }}
                                >
                                  <span style={{ fontSize: 18 }}>{option.icon}</span>
                                  <span style={{
                                    fontSize: 14,
                                    fontWeight: sortBy === option.value ? 600 : 400,
                                    color: sortBy === option.value ? '#06b6d4' : '#d4d4d8'
                                  }}>
                                    {option.label}
                                  </span>
                                  {sortBy === option.value && (
                                    <span style={{
                                      marginLeft: 'auto',
                                      width: 8, height: 8,
                                      borderRadius: '50%',
                                      background: '#06b6d4',
                                      boxShadow: '0 0 10px #06b6d4'
                                    }} />
                                  )}
                                </button>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                      {sortedProductGroups.map((group, i) => (
                        <ProductCard
                          key={`${group.group_id}-${sortBy}`}
                          group={group}
                          symbol={result.currency_symbol || currentCountry.symbol}
                          index={i}
                          sortBy={sortBy}
                          postalCode={result.postal_code}
                          onAddToCart={addToCart}
                          isInCart={isInCart}
                          onToggleFavorite={toggleFavorite}
                          isFavorite={(id) => favorites.some(f => f.id === id)}
                          onToggleSaveGroup={toggleSaveGroup}
                          isGroupSaved={(id) => savedGroups.some(g => g.group_id === id)}
                          onTogglePriceAlert={togglePriceAlert}
                          isAlertSet={(id) => priceAlerts.some(a => a.id === id)}
                        />
                      ))}
                    </div>

                    {/* Related Products Section */}
                    {result.related_products && result.related_products.length > 0 && (
                      <div style={{
                        marginTop: 40, padding: 28,
                        background: 'linear-gradient(180deg, #111114 0%, #0a0a0d 100%)',
                        border: '1px solid #1f1f24', borderRadius: 20,
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                          <div style={{
                            width: 36, height: 36, borderRadius: 10,
                            background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            <Sparkles size={20} color="#fff" />
                          </div>
                          <span style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>You Might Also Like</span>
                        </div>
                        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                          {result.related_products.map((item, i) => (
                            <button
                              key={i}
                              onClick={() => { setQuery(item.search_term); handleSearch(); }}
                              style={{
                                display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 6,
                                padding: '14px 20px', background: '#18181b', border: '1px solid #27272a',
                                borderRadius: 14, cursor: 'pointer', transition: 'all 0.2s',
                                minWidth: 140,
                              }}
                              onMouseEnter={(e) => { e.currentTarget.style.background = '#1f1f24'; e.currentTarget.style.borderColor = '#3f3f46'; }}
                              onMouseLeave={(e) => { e.currentTarget.style.background = '#18181b'; e.currentTarget.style.borderColor = '#27272a'; }}
                            >
                              <span style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>{item.name}</span>
                              <span style={{ fontSize: 13, color: '#22c55e', fontWeight: 700 }}>{item.price}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <EmptyState message={`No products found for "${result.query}" in ${currentCountry.name}`} />
                )
              ) : (
                <EmptyState country={currentCountry.name} />
              )}

            </>
          )}
        </div>{/* close maxWidth div */}
      </div>{/* close marginLeft div */}

      {/* Floating Cart Button */}
      {totalCartItems > 0 && (
        <button
          onClick={() => setCartOpen(true)}
          style={{
            position: 'fixed', bottom: 28, left: sidebarExpanded ? 280 : 100,
            width: 56, height: 56, borderRadius: 16,
            background: 'linear-gradient(135deg, #22c55e, #16a34a)',
            border: 'none', cursor: 'pointer', zIndex: 50,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 10px 40px rgba(34, 197, 94, 0.4)',
            transition: 'all 0.3s ease',
          }}
        >
          <ShoppingCart size={24} color="#fff" />
          <span style={{
            position: 'absolute', top: -6, right: -6,
            width: 22, height: 22, borderRadius: '50%',
            background: '#ef4444', color: '#fff',
            fontSize: 11, fontWeight: 800,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(239, 68, 68, 0.5)',
          }}>
            {totalCartItems}
          </span>
        </button>
      )}

      {/* Cart Panel */}
      <CartPanel
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        items={cartItems}
        onRemove={removeFromCart}
        onUpdateQuantity={updateCartQuantity}
        onClear={clearCart}
        onSearchRelated={handleSearchRelatedFromCart}
        onOptimize={handleOptimizeCart}
        symbol={result?.currency_symbol || currentCountry.symbol}
        isLoading={loading}
      />

    </div>
  );
}

function CartResultsView({ data }: { data: CartOptimizationResponse }) {
  const [activeStrategyName, setActiveStrategyName] = useState(data.best_strategy);

  // Reset active strategy when data changes (new optimization)
  if (data.best_strategy !== activeStrategyName && !data.strategies.some(s => s.name === activeStrategyName)) {
    setActiveStrategyName(data.best_strategy);
  }

  const best = data.strategies.find(s => s.name === activeStrategyName) || data.strategies[0];
  const others = data.strategies.filter(s => s.name !== activeStrategyName);

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', paddingBottom: 100 }}>
      {/* Header */}
      <div style={{ marginBottom: 40, textAlign: 'center' }}>
        <h2 style={{ fontSize: 32, fontWeight: 800, color: '#fff', marginBottom: 8 }}>Smart Cart Optimization</h2>
        <p style={{ color: '#a1a1aa', fontSize: 16 }}>
          We optimized your bundle of <span style={{ color: '#fff', fontWeight: 600 }}>{data.strategies[0]?.items.length} items</span>.
        </p>
      </div>

      {/* Active Strategy Card */}
      {best && (
        <div style={{
          background: 'linear-gradient(135deg, #18181b, #0f172a)',
          border: '2px solid #22c55e', borderRadius: 24, padding: 32,
          marginBottom: 40, position: 'relative', overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(34, 197, 94, 0.15)'
        }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: '#22c55e' }} />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
            <div>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 50,
                background: 'rgba(34, 197, 94, 0.1)', color: '#4ade80',
                fontSize: 12, fontWeight: 800, marginBottom: 16, letterSpacing: 0.5
              }}>
                <Sparkles size={14} /> SELECTED OPTION
              </div>
              <h3 style={{ fontSize: 28, fontWeight: 800, color: '#fff', marginBottom: 8 }}>{best.name}</h3>
              {best.savings > 0 ? (
                <p style={{ color: '#4ade80', fontSize: 16, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <TrendingDown size={18} />
                  You save {data.currency_symbol}{best.savings.toFixed(0)} with this bundle
                </p>
              ) : (
                <p style={{ color: '#94a3b8', fontSize: 15 }}>Standard market price.</p>
              )}
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 14, color: '#94a3b8', fontWeight: 500, marginBottom: 4 }}>Total Bundle Cost</div>
              <div style={{ fontSize: 48, fontWeight: 800, color: '#fff', letterSpacing: '-1px' }}>
                {data.currency_symbol}{best.total_cost.toFixed(0)}
              </div>
              <div style={{ fontSize: 13, color: '#64748b' }}>
                Includes delivery & fees: {data.currency_symbol}{best.fees.toFixed(0)}
              </div>
            </div>
          </div>

          {/* Items Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {best.items.map((item, idx) => {
              const pConfig = PLATFORM_CONFIG[item.product.platform] || PLATFORM_CONFIG['amazon_in']; // Fallback
              return (
                <div key={idx} style={{
                  background: 'rgba(255,255,255,0.03)', padding: 16, borderRadius: 16,
                  border: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: 16, alignItems: 'center'
                }}>
                  <div style={{
                    width: 64, height: 64, borderRadius: 12, background: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 4
                  }}>
                    <img src={item.product.image_url} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#e2e8f0', marginBottom: 6, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.product.title}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{
                          width: 20, height: 20, borderRadius: 6, background: '#fff',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          border: `1px solid ${pConfig?.color || '#333'}`
                        }}>
                          <img src={pConfig?.logoUrl} style={{ width: 14, height: 14 }} onError={(e) => e.currentTarget.style.display = 'none'} />
                        </div>
                        <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 500 }}>{pConfig?.name}</span>
                      </div>

                      <span style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>
                        {data.currency_symbol}{item.product.price_breakdown.base_price.toFixed(0)}
                      </span>
                    </div>
                    {item.product.unit_price_display && (
                      <div style={{ fontSize: 11, color: '#52525b', marginTop: 2 }}>{item.product.unit_price_display}</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Other Strategies */}
      {others.length > 0 && (
        <>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#52525b', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16, marginLeft: 8 }}>
            Other Options
          </div>
          {others.map((s, i) => (
            <button key={i}
              onClick={() => setActiveStrategyName(s.name)}
              style={{
                width: '100%', textAlign: 'left',
                background: '#111114', border: '1px solid #27272a',
                borderRadius: 16, padding: '20px 24px', marginBottom: 16,
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                opacity: 0.8, transition: 'all 0.2s', cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '1';
                e.currentTarget.style.borderColor = '#3f3f46';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '0.8';
                e.currentTarget.style.borderColor = '#27272a';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#27272a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, color: '#a1a1aa' }}>
                  {i + 2}
                </div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 600, color: '#e2e8f0' }}>{s.name}</div>
                  <div style={{ fontSize: 13, color: '#71717a' }}>Delivery & Fees: {data.currency_symbol}{s.fees.toFixed(0)}</div>
                </div>
              </div>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#cbd5e1' }}>
                {data.currency_symbol}{s.total_cost.toFixed(0)}
              </div>
            </button>
          ))}
        </>
      )}
    </div>
  );
}

function EmptyState({ message, country }: { message?: string; country?: string }) {
  return (
    <div style={{
      background: '#0e0e11', border: '1px solid #1a1a1e', borderRadius: 24, padding: '80px 40px', textAlign: 'center',
    }}>
      <div style={{
        width: 80, height: 80, borderRadius: 24, margin: '0 auto 24px',
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(6, 182, 212, 0.15))',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Search size={36} color="#52525b" />
      </div>
      <h3 style={{ fontSize: 22, fontWeight: 600, marginBottom: 10 }}>{message || 'Start Searching'}</h3>
      <p style={{ color: '#52525b', fontSize: 15 }}>
        {message ? 'Try a different search term' : `Enter a product and postal code to compare prices in ${country}`}
      </p>
    </div>
  );
}

function ProductCard({
  group, symbol, index, sortBy, postalCode, onAddToCart, isInCart,
  onToggleFavorite, isFavorite, onToggleSaveGroup, isGroupSaved,
  onTogglePriceAlert, isAlertSet
}: {
  group: ProductGroup; symbol: string; index: number; sortBy: any; postalCode: string;
  onAddToCart: (product: ProductResult) => void;
  isInCart: (productId: string) => boolean;
  onToggleFavorite: (product: ProductResult) => void;
  isFavorite: (productId: string) => boolean;
  onToggleSaveGroup: (group: ProductGroup) => void;
  isGroupSaved: (groupId: string) => boolean;
  onTogglePriceAlert: (product: ProductResult) => void;
  isAlertSet: (productId: string) => boolean;
}) {
  const best = group.best_price;
  const fastest = group.fastest_delivery;

  // Sort products based on sortBy option
  const sortedProducts = useMemo(() => {
    // Create a shallow copy to sort
    const products = [...group.products];

    if (sortBy === 'price_low') {
      return products.sort((a, b) => {
        const priceA = Number(a.price_breakdown.total_landed_cost) || 0;
        const priceB = Number(b.price_breakdown.total_landed_cost) || 0;
        if (priceA === priceB) return 0;
        return priceA - priceB;
      });
    }

    if (sortBy === 'price_high') {
      return products.sort((a, b) => {
        const priceA = Number(a.price_breakdown.total_landed_cost) || 0;
        const priceB = Number(b.price_breakdown.total_landed_cost) || 0;
        if (priceA === priceB) return 0;
        return priceB - priceA;
      });
    }

    if (sortBy === 'time_fast') {
      return products.sort((a, b) =>
        a.eta_minutes - b.eta_minutes
      );
    }

    // relevance - default to price low to high for better comparison mixed across platforms
    return products.sort((a, b) => {
      const priceA = Number(a.price_breakdown.total_landed_cost) || 0;
      const priceB = Number(b.price_breakdown.total_landed_cost) || 0;
      return priceA - priceB;
    });
  }, [group.products, sortBy]);

  return (
    <div style={{
      background: 'linear-gradient(180deg, #0e0e11 0%, #0a0a0d 100%)',
      border: '1px solid #1a1a1e', borderRadius: 24, overflow: 'hidden',
      boxShadow: '0 20px 60px rgba(0,0,0,0.3)', animation: `fadeUp 0.5s ease ${index * 0.1}s forwards`, opacity: 0,
    }}>
      <style>{`@keyframes fadeUp { to { opacity: 1; } }`}</style>

      {/* Header */}
      <div style={{ padding: '28px 32px', borderBottom: '1px solid #141416', display: 'flex', gap: 24, alignItems: 'flex-start' }}>
        {/* Product Group Image */}
        <div style={{
          width: 100, height: 100, borderRadius: 16, overflow: 'hidden',
          background: '#fff', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
        }}>
          {best.image_url ? (
            <img
              src={best.image_url}
              alt={group.canonical_title}
              style={{ width: '85%', height: '85%', objectFit: 'contain' }}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.parentElement!.style.background = '#27272a';
              }}
            />
          ) : (
            <span style={{ fontSize: 32 }}>🛍️</span>
          )}
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <h3 style={{
              fontSize: 20, fontWeight: 700, marginBottom: 20, lineHeight: 1.4, flex: 1,
              display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', height: 56
            }} title={group.canonical_title}>{group.canonical_title}</h3>

            <button
              onClick={() => onToggleSaveGroup(group)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '10px 16px', borderRadius: 12,
                background: isGroupSaved(group.group_id) ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255,255,255,0.05)',
                border: isGroupSaved(group.group_id) ? '1px solid #6366f1' : '1px solid #27272a',
                color: isGroupSaved(group.group_id) ? '#818cf8' : '#a1a1aa',
                cursor: 'pointer', transition: 'all 0.2s',
              }}
              onMouseEnter={e => {
                if (!isGroupSaved(group.group_id)) {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                  e.currentTarget.style.borderColor = '#3f3f46';
                }
              }}
              onMouseLeave={e => {
                if (!isGroupSaved(group.group_id)) {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                  e.currentTarget.style.borderColor = '#27272a';
                }
              }}
            >
              <Bookmark size={18} fill={isGroupSaved(group.group_id) ? '#818cf8' : 'none'} />
              <span style={{ fontSize: 13, fontWeight: 700 }}>
                {isGroupSaved(group.group_id) ? 'SAVED' : 'SAVE COMPARE'}
              </span>
            </button>
          </div>

          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            {/* Best Price */}
            {/* Best Price */}
            <a href={best.url} target="_blank" rel="noopener noreferrer" style={{
              flex: 1, minWidth: 260, padding: 20, borderRadius: 16,
              background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.08), rgba(34, 197, 94, 0.02))',
              border: '1px solid rgba(34, 197, 94, 0.12)',
              textDecoration: 'none', cursor: 'pointer', display: 'block'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(34, 197, 94, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <TrendingDown size={24} color="#22c55e" />
                </div>
                <div>
                  <p style={{ fontSize: 13, color: '#71717a', marginBottom: 4 }}>Best Price</p>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                    <span style={{ fontSize: 28, fontWeight: 800, color: '#22c55e' }}>{symbol}{best.price_breakdown.total_landed_cost.toFixed(2)}</span>
                    <span style={{ fontSize: 13, color: '#52525b' }}>on {PLATFORM_CONFIG[best.platform]?.name || best.platform}</span>
                  </div>
                </div>
              </div>
            </a>

            {/* Fastest */}
            {/* Fastest */}
            <a href={fastest.url} target="_blank" rel="noopener noreferrer" style={{
              flex: 1, minWidth: 260, padding: 20, borderRadius: 16,
              background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.08), rgba(6, 182, 212, 0.02))',
              border: '1px solid rgba(6, 182, 212, 0.12)',
              textDecoration: 'none', cursor: 'pointer', display: 'block'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(6, 182, 212, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Zap size={24} color="#06b6d4" />
                </div>
                <div>
                  <p style={{ fontSize: 13, color: '#71717a', marginBottom: 4 }}>Fastest Delivery</p>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                    <span style={{ fontSize: 28, fontWeight: 800, color: '#06b6d4' }}>{fastest.eta_display}</span>
                    <span style={{ fontSize: 13, color: '#52525b' }}>via {PLATFORM_CONFIG[fastest.platform]?.name || fastest.platform}</span>
                  </div>
                </div>
              </div>
            </a>
          </div>

          {/* Enhanced Value Prop Badge */}
          {group.savings_message && (
            <div style={{
              marginTop: 20, padding: '12px 20px', borderRadius: 16,
              background: group.savings_message.includes('Pay only') ? 'rgba(6, 182, 212, 0.08)' : 'rgba(34, 197, 94, 0.08)',
              border: group.savings_message.includes('Pay only') ? '1px solid rgba(6, 182, 212, 0.2)' : '1px solid rgba(34, 197, 94, 0.2)',
              display: 'flex', alignItems: 'center', gap: 12
            }}>
              {group.savings_message.includes('Pay only') ? <Zap size={18} color="#06b6d4" /> : <TrendingDown size={18} color="#22c55e" />}
              <span style={{ fontSize: 14, fontWeight: 600, color: group.savings_message.includes('Pay only') ? '#06b6d4' : '#22c55e' }}>
                {group.savings_message}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Products */}
      <div>
        {sortedProducts.map((product, i) => {
          const isBest = product.id === best.id;
          const isFastest = product.id === fastest.id && !isBest;
          const isExpress = product.eta_minutes <= 60;
          const config = PLATFORM_CONFIG[product.platform];

          return (
            <div key={product.id} style={{
              display: 'flex', alignItems: 'center', gap: 18, padding: '20px 32px',
              borderBottom: i === sortedProducts.length - 1 ? 'none' : '1px solid #141416',
              background: isBest ? 'rgba(34, 197, 94, 0.02)' : 'transparent',
            }}>
              {/* Platform Logo */}
              <div style={{
                width: 52, height: 52, borderRadius: 14, flexShrink: 0, overflow: 'hidden',
                background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: `3px solid ${config?.color || '#333'}`,
              }}>
                <img
                  src={config?.logoUrl || ''}
                  alt={config?.name || product.platform}
                  style={{ width: 36, height: 36, objectFit: 'contain' }}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    if (target.parentElement) {
                      target.parentElement.style.background = config?.color || '#333';
                      target.parentElement.innerHTML = `<span style="font-size:16px;font-weight:800;color:#fff">${config?.shortName || product.platform.slice(0, 2).toUpperCase()}</span>`;
                    }
                  }}
                />
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                  <span style={{
                    padding: '6px 14px', borderRadius: 8, background: config?.color || '#333', fontSize: 12, fontWeight: 700,
                    color: ['#F8CB46', '#FFD100', '#FFE500', '#FEEE00', '#FFE600', '#FFC244'].includes(config?.color || '') ? '#000' : '#fff',
                  }}>{config?.name || product.platform}</span>
                  <span style={{
                    display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 8, fontSize: 12,
                    background: isExpress ? 'rgba(34, 197, 94, 0.12)' : '#141416',
                    color: isExpress ? '#22c55e' : '#71717a',
                  }}>
                    {isExpress ? <Zap size={13} /> : <Clock size={13} />}
                    {product.eta_display}
                  </span>
                  {isBest && <span style={{ padding: '6px 12px', borderRadius: 8, background: '#22c55e', color: '#000', fontSize: 11, fontWeight: 700 }}>BEST PRICE</span>}
                  {isFastest && <span style={{ padding: '6px 12px', borderRadius: 8, background: '#06b6d4', color: '#000', fontSize: 11, fontWeight: 700 }}>FASTEST</span>}
                  {product.stock_count && product.stock_count <= 5 && (
                    <span style={{
                      display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px',
                      borderRadius: 8, background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)',
                      color: '#f87171', fontSize: 11, fontWeight: 700
                    }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#ef4444', boxShadow: '0 0 8px #ef4444' }} />
                      Only {product.stock_count} left
                    </span>
                  )}
                </div>
                <p style={{ fontSize: 14, color: '#a1a1aa', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: 6 }}>{product.title}</p>
                {product.rating && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Star size={13} fill="#facc15" color="#facc15" />
                    <span style={{ fontSize: 13, color: '#71717a' }}>{product.rating} • {product.reviews_count?.toLocaleString()} reviews</span>
                  </div>
                )}
              </div>

              {/* Price */}
              <div style={{ textAlign: 'right', minWidth: 110 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center' }}>
                  <div style={{ fontSize: 13, color: '#71717a', fontWeight: 600, marginBottom: 2 }}>Store: {symbol}{product.price_breakdown.base_price.toFixed(0)}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 26, fontWeight: 800, color: isBest ? '#22c55e' : '#fff' }}>
                      {symbol}{product.price_breakdown.total_landed_cost.toFixed(0)}
                    </span>
                    {product.unit_price_display && (
                      <span style={{ fontSize: 13, color: '#71717a', fontWeight: 500, marginRight: 2 }}>
                        ({product.unit_price_display})
                      </span>
                    )}

                    {/* Info Tooltip Hook */}
                    <ProductInfoTooltip product={product} symbol={symbol} />
                  </div>

                  <p style={{ fontSize: 13, color: (product.price_breakdown.delivery_fee + (product.price_breakdown.platform_fee || 0)) > 0 ? '#71717a' : '#22c55e', marginTop: 4 }}>
                    {(product.price_breakdown.delivery_fee + (product.price_breakdown.platform_fee || 0)) > 0
                      ? `+${symbol}${(product.price_breakdown.delivery_fee + (product.price_breakdown.platform_fee || 0)).toFixed(0)} fees`
                      : '✓ Free delivery'}
                  </p>

                  {/* AI Price Prediction */}
                  {product.price_prediction?.action === 'WAIT' ? (
                    <div style={{
                      fontSize: 11, fontWeight: 700, color: '#fbbf24', marginTop: 4,
                      display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end',
                      background: 'rgba(251, 191, 36, 0.1)', padding: '2px 6px', borderRadius: 4
                    }}>
                      <Clock size={12} />
                      WAIT • Save {symbol}{product.price_prediction.potential_savings.toFixed(0)}
                    </div>
                  ) : product.price_prediction?.action === 'BUY_NOW' && product.price_prediction.confidence > 85 && (
                    <div style={{
                      fontSize: 11, fontWeight: 700, color: '#4ade80', marginTop: 4,
                      display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end'
                    }}>
                      <TrendingDown size={12} />
                      GREAT PRICE
                    </div>
                  )}
                </div>
              </div>

              {/* Price Alert Button */}
              <button
                onClick={() => onTogglePriceAlert(product)}
                title={isAlertSet(product.id) ? 'Remove price alert' : 'Set price alert'}
                style={{
                  width: 44, height: 44, borderRadius: 12, border: '1px solid #27272a',
                  background: isAlertSet(product.id) ? 'rgba(245, 158, 11, 0.1)' : 'transparent',
                  color: isAlertSet(product.id) ? '#f59e0b' : '#71717a',
                  cursor: 'pointer', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(245, 158, 11, 0.15)';
                  e.currentTarget.style.borderColor = '#f59e0b';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = isAlertSet(product.id) ? 'rgba(245, 158, 11, 0.1)' : 'transparent';
                  e.currentTarget.style.borderColor = isAlertSet(product.id) ? '#f59e0b' : '#27272a';
                }}
              >
                <Bell size={18} fill={isAlertSet(product.id) ? '#f59e0b' : 'none'} />
              </button>

              {/* Favorites Button */}
              <button
                onClick={() => onToggleFavorite(product)}
                title={isFavorite(product.id) ? 'Remove from favourites' : 'Add to favourites'}
                style={{
                  width: 44, height: 44, borderRadius: 12, border: '1px solid #27272a',
                  background: isFavorite(product.id) ? 'rgba(244, 63, 94, 0.1)' : 'transparent',
                  color: isFavorite(product.id) ? '#f43f5e' : '#71717a',
                  cursor: 'pointer', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(244, 63, 94, 0.15)';
                  e.currentTarget.style.borderColor = '#f43f5e';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = isFavorite(product.id) ? 'rgba(244, 63, 94, 0.1)' : 'transparent';
                  e.currentTarget.style.borderColor = isFavorite(product.id) ? '#f43f5e' : '#27272a';
                }}
              >
                <Heart size={18} fill={isFavorite(product.id) ? '#f43f5e' : 'none'} />
              </button>

              {/* Add to Cart */}
              <button
                onClick={() => onAddToCart(product)}
                title={isInCart(product.id) ? 'Already in cart (click to add more)' : 'Add to cart'}
                style={{
                  width: 44, height: 44, borderRadius: 12, border: 'none',
                  background: isInCart(product.id)
                    ? 'linear-gradient(135deg, #16a34a, #15803d)'
                    : 'linear-gradient(135deg, #22c55e, #16a34a)',
                  color: '#fff', cursor: 'pointer', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 4px 15px rgba(34, 197, 94, 0.25)',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.1)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(34, 197, 94, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(34, 197, 94, 0.25)';
                }}
              >
                {isInCart(product.id) ? <ShoppingCart size={18} /> : <Plus size={20} />}
              </button>

              {/* Visit */}
              <a href={product.url} target="_blank" rel="noopener noreferrer" style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '14px 24px',
                background: 'linear-gradient(135deg, #1f1f24, #141416)', border: '1px solid #27272a', borderRadius: 12,
                color: '#fff', fontSize: 14, fontWeight: 500, textDecoration: 'none',
              }}>
                Visit <ArrowRight size={16} />
              </a>
            </div>
          );
        })}
      </div>

      {/* Trust Signal Footer */}
      <div style={{
        marginTop: 20, paddingTop: 16, borderTop: '1px solid #27272a',
        display: 'flex', alignItems: 'center', gap: 8, color: '#71717a',
        fontSize: 11, fontWeight: 500
      }}>
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 8px #22c55e' }} />
        Live price verified for {postalCode} at {new Date().toLocaleTimeString()}
      </div>
    </div>
  );
}

function ProductInfoTooltip({ product, symbol }: { product: any, symbol: string }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div style={{ position: 'relative' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}>
      <Info size={14} color="#71717a" style={{ cursor: 'help', marginTop: 4 }} />

      {isHovered && (
        <div style={{
          position: 'absolute', right: 0, bottom: '100%', marginBottom: 10,
          padding: 12, background: '#18181b', border: '1px solid #3f3f46',
          borderRadius: 12, width: 160, zIndex: 100, boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#a1a1aa', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>Price Breakdown</div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#e4e4e7', marginBottom: 6 }}>
            <span>Item Price</span>
            <span>{symbol}{product.price_breakdown.base_price.toFixed(0)}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#a1a1aa', marginBottom: 4 }}>
            <span>Platform Fee</span>
            <span>{symbol}{product.price_breakdown.platform_fee.toFixed(0)}</span>
          </div>

          {product.price_breakdown.handling_fee > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#a1a1aa', marginBottom: 4 }}>
              <span>Handling</span>
              <span>{symbol}{product.price_breakdown.handling_fee.toFixed(0)}</span>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: product.price_breakdown.delivery_fee > 0 ? '#ef4444' : '#22c55e', marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid #27272a' }}>
            <span>Delivery</span>
            <span>{product.price_breakdown.delivery_fee > 0 ? `${symbol}${product.price_breakdown.delivery_fee.toFixed(0)}` : 'FREE'}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>Total</span>
            <span style={{ fontSize: 18, fontWeight: 800, color: '#fff' }}>{symbol}{product.price_breakdown.total_landed_cost.toFixed(0)}</span>
          </div>
        </div>
      )}
    </div>
  );
}

function SkeletonCard() {
  return (
    <div style={{
      background: '#0e0e11', borderRadius: 24, padding: 28,
      border: '1px solid #1f1f24', marginBottom: 24,
      display: 'flex', gap: 32, alignItems: 'flex-start'
    }}>
      {/* Image Skeleton */}
      <div style={{
        width: 100, height: 100, borderRadius: 16,
        background: '#1f1f24', flexShrink: 0
      }} className="animate-pulse" />

      <div style={{ flex: 1 }}>
        {/* Title Skeleton */}
        <div style={{
          height: 32, width: '60%', background: '#1f1f24',
          borderRadius: 8, marginBottom: 24
        }} className="animate-pulse" />

        {/* Boxes Skeleton */}
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <div style={{
            flex: 1, minWidth: 260, height: 110,
            background: '#1f1f24', borderRadius: 16
          }} className="animate-pulse" />
          <div style={{
            flex: 1, minWidth: 260, height: 110,
            background: '#1f1f24', borderRadius: 16
          }} className="animate-pulse" />
        </div>
      </div>
    </div>
  );
}
