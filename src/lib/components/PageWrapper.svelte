<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    title?: string;
    description?: string;
    keywords?: string;
    author?: string;
    canonical?: string;
    noindex?: boolean;
    nofollow?: boolean;
    ogTitle?: string;
    ogDescription?: string;
    ogImage?: string;
    ogType?: string;
    ogUrl?: string;
    twitterCard?: 'summary' | 'summary_large_image' | 'app' | 'player';
    twitterSite?: string;
    twitterCreator?: string;
    twitterTitle?: string;
    twitterDescription?: string;
    twitterImage?: string;
    themeColor?: string;
    viewport?: string;
    lang?: string;
    children: Snippet;
  }

  let {
    title = '',
    description = '',
    keywords = '',
    author = '',
    canonical = '',
    noindex = false,
    nofollow = false,
    ogTitle = '',
    ogDescription = '',
    ogImage = '',
    ogType = 'website',
    ogUrl = '',
    twitterCard = 'summary',
    twitterSite = '',
    twitterCreator = '',
    twitterTitle = '',
    twitterDescription = '',
    twitterImage = '',
    themeColor = '#3b82f6',
    viewport = 'width=device-width, initial-scale=1',
    lang = 'en',
    children
  }: Props = $props();

  // Computed values for fallbacks
  let finalOgTitle = $derived(ogTitle || title);
  let finalOgDescription = $derived(ogDescription || description);
  let finalTwitterTitle = $derived(twitterTitle || finalOgTitle);
  let finalTwitterDescription = $derived(twitterDescription || finalOgDescription);
  let finalTwitterImage = $derived(twitterImage || ogImage);
  let robotsContent = $derived(
    `${noindex ? 'noindex' : 'index'},${nofollow ? 'nofollow' : 'follow'}`
  );
</script>

<svelte:head>
  <!-- Basic Meta Tags -->
  {#if title}
    <title>{title}</title>
  {/if}

  {#if description}
    <meta name="description" content={description} />
  {/if}

  {#if keywords}
    <meta name="keywords" content={keywords} />
  {/if}

  {#if author}
    <meta name="author" content={author} />
  {/if}

  <meta name="viewport" content={viewport} />
  <meta name="robots" content={robotsContent} />

  {#if themeColor}
    <meta name="theme-color" content={themeColor} />
  {/if}

  {#if canonical}
    <link rel="canonical" href={canonical} />
  {/if}

  <!-- Open Graph Meta Tags -->
  {#if finalOgTitle}
    <meta property="og:title" content={finalOgTitle} />
  {/if}

  {#if finalOgDescription}
    <meta property="og:description" content={finalOgDescription} />
  {/if}

  {#if ogImage}
    <meta property="og:image" content={ogImage} />
  {/if}

  {#if ogType}
    <meta property="og:type" content={ogType} />
  {/if}

  {#if ogUrl}
    <meta property="og:url" content={ogUrl} />
  {/if}

  <!-- Twitter Card Meta Tags -->
  <meta name="twitter:card" content={twitterCard} />

  {#if twitterSite}
    <meta name="twitter:site" content={twitterSite} />
  {/if}

  {#if twitterCreator}
    <meta name="twitter:creator" content={twitterCreator} />
  {/if}

  {#if finalTwitterTitle}
    <meta name="twitter:title" content={finalTwitterTitle} />
  {/if}

  {#if finalTwitterDescription}
    <meta name="twitter:description" content={finalTwitterDescription} />
  {/if}

  {#if finalTwitterImage}
    <meta name="twitter:image" content={finalTwitterImage} />
  {/if}
</svelte:head>

{@render children()}
