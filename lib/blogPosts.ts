/**
 * PrimeBot Markets blogs — original posts, managed as data.
 *
 * Two blogs share this catalog:
 *  - 'trading' → /blog        (education for traders, English)
 *  - 'sales'   → /sales-blog  (PrimeBot product news, guides, offers)
 *
 * Content rules (site policy): education and product facts only —
 * never guaranteed-profit claims; trading always carries risk.
 */

export type BlogKind = 'trading' | 'sales';

export interface BlogBlock {
  type: 'p' | 'h2' | 'list';
  text?: string;
  items?: string[];
}

export interface BlogPost {
  blog: BlogKind;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  date: string; // YYYY-MM-DD
  readMins: number;
  content: BlogBlock[];
}

export const BLOG_POSTS: BlogPost[] = [
  // ============================ TRADING BLOG ============================
  {
    blog: 'trading',
    slug: 'gold-xauusd-trading-beginners-guide',
    title: 'Gold (XAUUSD) Trading for Beginners: A Complete 2026 Guide',
    excerpt:
      'Why gold moves, when it moves, and how to size your trades safely — the essentials every new XAUUSD trader should understand before risking real money.',
    category: 'Gold Trading',
    date: '2026-10-20',
    readMins: 7,
    content: [
      { type: 'p', text: 'Gold is the most traded metal in the world, and on MetaTrader it appears as XAUUSD — the price of one troy ounce of gold in US dollars. It attracts beginners because it moves every day, but those same moves are exactly what makes it dangerous without a plan.' },
      { type: 'h2', text: 'What moves the gold price?' },
      { type: 'list', items: [
        'The US dollar: gold usually moves opposite to a strong dollar.',
        'Interest-rate expectations: when traders expect rate cuts, gold often rises.',
        'Fear and uncertainty: wars, banking stress and stock-market crashes push money into gold as a safe haven.',
        'US economic data: inflation (CPI), jobs (NFP) and Federal Reserve speeches can move gold $20–$40 in minutes.',
      ] },
      { type: 'h2', text: 'When is gold most active?' },
      { type: 'p', text: 'The liveliest hours are the London session and the first hours of New York (roughly 12:30–18:30 Pakistan time). Spreads are tightest then. Around major US news releases, spreads widen sharply — many experienced traders simply stay out for 15–30 minutes.' },
      { type: 'h2', text: 'Position sizing: the rule that keeps you alive' },
      { type: 'p', text: 'On a standard account, a 0.01 lot of gold means roughly $1 of profit or loss for every $1 the price moves. On a cent account the same trade is one hundredth of that, which is why cent accounts are popular for learning and for automated strategies. Whatever the account type, risk no more than 1% of your balance on a single idea.' },
      { type: 'h2', text: 'A simple beginner checklist' },
      { type: 'list', items: [
        'Check the economic calendar before trading — know when CPI, NFP and FOMC are due.',
        'Trade with the daily trend, not against it.',
        'Set a stop loss on every single trade. No exceptions.',
        'Keep a journal: entry, reason, result. Review it weekly.',
        'Practise on demo or a small cent account until your process is boring and consistent.',
      ] },
      { type: 'p', text: 'Gold rewards patience and punishes excitement. Learn its rhythm first, size small, and let consistency — not one big win — build the account.' },
    ],
  },
  {
    blog: 'trading',
    slug: 'cent-accounts-explained',
    title: 'Cent Accounts Explained: How They Work and Who Should Use One',
    excerpt:
      'A cent account displays your balance in cents instead of dollars — but what does that actually change? Lot sizes, risk, strategy testing and the honest limitations, explained plainly.',
    category: 'Trading Basics',
    date: '2026-10-19',
    readMins: 6,
    content: [
      { type: 'p', text: 'Deposit $50 into a cent account and your platform shows 5,000 — not dollars, but cents. Everything else (prices, charts, spreads) is identical to a standard account. Only the unit of account changes.' },
      { type: 'h2', text: 'Why traders choose cent accounts' },
      { type: 'list', items: [
        'Tiny real risk: a strategy can be tested live with mistakes costing cents, not dollars.',
        'Psychology: real money is on the line, so emotions are real — unlike demo trading.',
        'Grid and recovery systems: strategies that open many small positions can be sized precisely.',
        'Long testing periods: months of live data can be collected on a small deposit.',
      ] },
      { type: 'h2', text: 'What cent accounts do NOT change' },
      { type: 'p', text: 'Leverage risk is still real. A cent account can still be blown by oversizing — opening large lots against a strong trend will drain 5,000 cents exactly as surely as it drains $5,000. The unit is smaller; the discipline required is the same.' },
      { type: 'h2', text: 'Reading targets on a cent account' },
      { type: 'p', text: 'Because the platform shows cents, every money target must be read in cents. A profit target of "2,000" on the screen means 2,000 cents = $20. When you configure an Expert Advisor that asks for a dollar target, multiply by 100: a $20 daily goal is entered as 2000. Confusing the two units is the single most common cent-account mistake.' },
      { type: 'h2', text: 'Who should use one?' },
      { type: 'p', text: 'Beginners learning execution, traders forward-testing a new strategy, and EA users validating a system live before scaling up. If that is you, a cent account is the most honest classroom the market offers.' },
    ],
  },
  {
    blog: 'trading',
    slug: 'risk-management-rules-every-trader',
    title: '7 Risk Management Rules Every Trader Should Follow',
    excerpt:
      'Strategies come and go, but accounts survive because of risk rules. These seven simple rules protect more capital than any indicator ever will.',
    category: 'Risk Management',
    date: '2026-10-18',
    readMins: 6,
    content: [
      { type: 'p', text: 'Ask professional traders what keeps them in business and few will name an entry signal. Almost all will name risk management. These are the rules that matter most.' },
      { type: 'list', items: [
        'Rule 1 — Risk 1% or less per trade. Ten losses in a row then cost 10%, painful but survivable.',
        'Rule 2 — Always use a stop loss. "It will come back" is not a risk plan.',
        'Rule 3 — Cap your daily loss. Decide a number (for example 3%) and stop trading when it is hit.',
        'Rule 4 — Respect the news. Spreads and slippage around CPI, NFP and FOMC can jump stops; many systems pause entries around major releases.',
        'Rule 5 — Never add to a losing trade out of anger. Averaging down must be a planned strategy with a hard maximum, or it is just doubling a mistake.',
        'Rule 6 — Withdraw profits regularly. Money in the bank cannot be given back to the market.',
        'Rule 7 — Write it down. A one-page written plan beats a hundred rules you only "remember" when it is too late.',
      ] },
      { type: 'h2', text: 'The maths of survival' },
      { type: 'p', text: 'Lose 10% and you need an 11% gain to recover. Lose 50% and you need 100%. Lose 90% and you need 900%. Protecting the downside is not caution — it is arithmetic.' },
      { type: 'p', text: 'Apply these rules for ninety days and judge your trading again. Most traders find the strategy was never the problem.' },
    ],
  },
  {
    blog: 'trading',
    slug: 'mt5-expert-advisors-how-they-work',
    title: 'MT5 Expert Advisors: What They Are and How They Actually Work',
    excerpt:
      'Expert Advisors automate trading rules on MetaTrader 5 — but what do they really do, what can they not do, and how should a beginner evaluate one honestly?',
    category: 'Automation',
    date: '2026-10-17',
    readMins: 7,
    content: [
      { type: 'p', text: 'An Expert Advisor (EA) is a program that runs inside MetaTrader 5 and follows written rules: when conditions X and Y are true, open a trade; when Z happens, close it. It does not predict the future — it executes a process without sleep, fear or greed.' },
      { type: 'h2', text: 'What a good EA actually does' },
      { type: 'list', items: [
        'Watches the market 24 hours a day and never misses its setup.',
        'Applies identical position sizing and exit rules to every trade.',
        'Manages baskets of trades: break-even calculations, basket take-profits, recovery logic.',
        'Enforces protections a human forgets: daily targets, drawdown limits, news-time pauses.',
      ] },
      { type: 'h2', text: 'What no EA can do' },
      { type: 'p', text: 'No EA can guarantee profit, and any seller who promises one is not being honest with you. Markets change; a strategy that worked last year can struggle this year. An EA is a tool for disciplined execution — the risk of loss always remains, and drawdowns are part of every real system.' },
      { type: 'h2', text: 'How to evaluate an EA before buying' },
      { type: 'list', items: [
        'Ask for the strategy logic in plain words. If the seller cannot explain it, walk away.',
        'Demand a demo or cent-account forward test, not only backtests.',
        'Check the protection features: maximum lot, drawdown stop, news filter.',
        'Confirm the license terms: which account numbers it works on, and how delivery and support happen.',
      ] },
      { type: 'p', text: 'Used with realistic expectations and proper risk settings, automation removes the weakest part of most trading — the emotional human click.' },
    ],
  },
  {
    blog: 'trading',
    slug: 'candlestick-charts-reading-basics',
    title: 'Candlestick Charts Explained: How to Read Price Action',
    excerpt:
      'Every MT5 chart is built from candlesticks — open, high, low and close in one small picture. Here is how to read them, and the few patterns beginners actually need.',
    category: 'Trading Basics',
    date: '2026-10-21',
    readMins: 6,
    content: [
      { type: 'p', text: 'Open any chart in MetaTrader 5 and you are looking at candlesticks — small shapes that summarise an entire period of trading (one minute, one hour, one day) in a single picture. Learning to read them is the first skill of chart-based trading, and it is simpler than it looks.' },
      { type: 'h2', text: 'The anatomy of one candle' },
      { type: 'list', items: [
        'The body: the thick part between the opening and closing price. A long body means the price moved strongly in one direction during that period.',
        'The wicks (shadows): the thin lines above and below the body. They show how far the price reached before being pulled back.',
        'Colour: most platforms paint a candle one colour when it closes higher than it opened (often green or white) and another when it closes lower (red or black).',
        'Size: a big candle means strong conviction in that direction; a tiny one means buyers and sellers were evenly matched.',
      ] },
      { type: 'h2', text: 'Why traders watch candle size and position' },
      { type: 'p', text: 'A long upper wick on a candle near a price high means buyers pushed up and were rejected — sellers stepped in. That rejection tells you something only in context: the same shape in the middle of nowhere means far less. Context — the trend, the price level, the session — is what turns shapes into information.' },
      { type: 'h2', text: 'Three patterns beginners should know first' },
      { type: 'list', items: [
        'Doji: a candle with almost no body, where open and close are nearly equal. It signals indecision — the market is pausing, often before a bigger move.',
        'Hammer: a small body at the top with a long lower wick. It shows sellers pushed the price down and buyers fought it back up within the period.',
        'Engulfing: a candle whose body completely covers the previous candle’s body, in the opposite colour. It can mark a shift of short-term control — but it is a hint, not a guarantee.',
      ] },
      { type: 'h2', text: 'What candlesticks cannot tell you' },
      { type: 'p', text: 'No pattern predicts the next move with certainty — markets can and do invalidate textbook setups every day. Treat candle reading as a language for describing what already happened, combine it with risk rules (a stop loss on every trade), and practise reading live candles on a demo or cent account for a few weeks before trusting any pattern with real money.' },
    ],
  },
  // ============================ SALES BLOG ==============================
  {
    blog: 'sales',
    slug: 'meet-the-primebot-lineup',
    title: 'Meet the PrimeBot Lineup: Five Trading Bots from $200 to $1,000',
    excerpt:
      'From the $200 starter to the $1,000 flagship — a plain-language tour of the five PrimeBot Markets Expert Advisors, what each one is built for, and how licensing works.',
    category: 'Product News',
    date: '2026-10-20',
    readMins: 6,
    content: [
      { type: 'p', text: 'PrimeBot Markets sells five MetaTrader Expert Advisors, priced from $200 to $1,000, each with a lifetime license locked to your own trading account number. Here is the honest tour.' },
      { type: 'h2', text: 'The lineup' },
      { type: 'list', items: [
        'Starter tier ($200): a single-strategy EA for traders automating their first system, designed for cent and standard accounts.',
        'Mid tiers: added protections — news-time entry pauses, daily profit targets and basket management.',
        'Flagship tier ($1,000): the full strategy stack with the most conservative default risk settings and priority support.',
      ] },
      { type: 'h2', text: 'What every PrimeBot includes' },
      { type: 'list', items: [
        'Lifetime license — one payment, no monthly fees.',
        'Account-number lock: your bot works on your account, so your purchase cannot be copied or resold.',
        'Urdu video setup guides and WhatsApp support from a real person.',
        'Honest demo videos: every product video on this site shows demo footage — we never publish fake profit screenshots.',
      ] },
      { type: 'h2', text: 'An honest word on expectations' },
      { type: 'p', text: 'A trading bot is software, not a promise. Markets carry risk and past behaviour never guarantees future results. Start any new bot on a demo or cent account, learn its settings with our guides, and only scale when you understand how it behaves in a drawdown.' },
      { type: 'p', text: 'Browse the full range on the Trading Bots page, watch the demo video on each product card, and message us on WhatsApp if you want help choosing the right tier.' },
    ],
  },
  {
    blog: 'sales',
    slug: 'how-to-buy-a-primebot-payment-delivery',
    title: 'How to Buy a PrimeBot: Payment, Verification and Delivery Explained',
    excerpt:
      'The complete buying journey — choose your bot, pay, share your payment slip for automatic verification, and receive your licensed EA by download and email.',
    category: 'Buying Guide',
    date: '2026-10-19',
    readMins: 5,
    content: [
      { type: 'h2', text: 'Step 1 — Choose your bot' },
      { type: 'p', text: 'Open the Trading Bots page and watch the demo video on the card. Each video is real demo footage with an Urdu voiceover explaining the strategy — what the bot does and what it does not do.' },
      { type: 'h2', text: 'Step 2 — Pay and keep the slip' },
      { type: 'p', text: 'Pay by the method shown at checkout and keep your payment slip. Then share your email, phone and WhatsApp number with the slip so we can verify and deliver.' },
      { type: 'h2', text: 'Step 3 — Automatic verification' },
      { type: 'p', text: 'Our system reads the name, transaction ID and amount on your slip and cross-checks them. A full match is approved automatically. If anything is unreadable or does not match, you will simply be asked to upload a clearer slip — no payment is ever lost in the process.' },
      { type: 'h2', text: 'Step 4 — Delivery' },
      { type: 'p', text: 'Approved orders unlock the Download button on your order and a copy is emailed to you. Your license is locked to the MT5 account number you provided, so send the correct account number at checkout — that lock is what protects your purchase from being copied.' },
      { type: 'h2', text: 'Step 5 — Set up with the guides' },
      { type: 'p', text: 'Follow the Urdu setup video for your bot, test on demo or a cent account first, and message support on WhatsApp any time you are stuck. A real person answers.' },
    ],
  },
  {
    blog: 'sales',
    slug: 'account-number-license-lock-protection',
    title: 'How the Account-Number License Lock Protects Your PrimeBot',
    excerpt:
      'Every PrimeBot is compiled for one MT5 account number. Here is why that protects buyers, how it works in practice, and what happens if you change brokers.',
    category: 'Product News',
    date: '2026-10-18',
    readMins: 5,
    content: [
      { type: 'p', text: 'Trading software is easy to copy — a single file can be forwarded to a hundred people in a minute. That hurts honest buyers, who paid for something pirates get free. PrimeBot solves this with an account-number license lock built into every EA.' },
      { type: 'h2', text: 'How it works' },
      { type: 'list', items: [
        'At checkout you give us your MT5 account number.',
        'Your EA is licensed to that number only. On any other account it simply will not trade.',
        'The check runs inside the bot itself — no internet activation, no extra software, nothing to install.',
      ] },
      { type: 'h2', text: 'What it means for you' },
      { type: 'list', items: [
        'Your purchase keeps its value: it cannot be leaked and resold cheaply.',
        'Support stays personal: we know exactly which build you are running.',
        'Changing broker or account? Message support — we will re-issue your license for your new account number.',
      ] },
      { type: 'p', text: 'One account, one license, lifetime use. It is the same protection used by professional software everywhere, applied to your trading bot.' },
    ],
  },
  {
    blog: 'sales',
    slug: 'setup-first-ea-on-mt5-step-by-step',
    title: 'Setting Up Your First EA on MT5: A Step-by-Step Beginner Guide',
    excerpt:
      'From downloading your PrimeBot file to seeing the smiley face on the chart — the full first-time MT5 setup, in plain steps anyone can follow.',
    category: 'Setup Guide',
    date: '2026-10-17',
    readMins: 6,
    content: [
      { type: 'h2', text: 'Before you start' },
      { type: 'list', items: [
        'MetaTrader 5 installed and logged into the account number your license was issued for.',
        'Your PrimeBot .ex5 file downloaded from your order page or email.',
        'A demo or cent account for the first test — always.',
      ] },
      { type: 'h2', text: 'The steps' },
      { type: 'list', items: [
        '1. In MT5, open File → Open Data Folder → MQL5 → Experts, and copy your .ex5 file there.',
        '2. Restart MT5 (or right-click Experts in the Navigator and choose Refresh).',
        '3. Open the chart for the symbol and timeframe in your bot guide (for gold bots, XAUUSD).',
        '4. Drag the EA from the Navigator onto the chart.',
        '5. In the settings window, tick "Allow Algo Trading", load the recommended settings from your guide, and press OK.',
        '6. Turn on the "Algo Trading" button in the top toolbar. A smiley face on the chart corner means your EA is running.',
      ] },
      { type: 'h2', text: 'If something looks wrong' },
      { type: 'p', text: 'Open the Experts and Journal tabs at the bottom of MT5 — the messages there explain almost every problem, from a wrong account number to a missing permission tick. Send a screenshot of that tab to our WhatsApp support and we will tell you the exact fix.' },
      { type: 'p', text: 'Let the bot run on demo for at least a few days. Watch how it opens and closes trades, learn its rhythm, and only then decide about going live — small first, always.' },
    ],
  },
  {
    blog: 'sales',
    slug: 'primebot-faq-before-you-buy',
    title: 'PrimeBot FAQ: 10 Questions Buyers Ask Before Ordering',
    excerpt:
      'Price tiers, lifetime licenses, the account-number lock, delivery, setup and honest expectations — the questions our support team hears most, answered in one place.',
    category: 'Buying Guide',
    date: '2026-10-21',
    readMins: 7,
    content: [
      { type: 'p', text: 'Before buying a trading bot, most people ask the same questions. Here are the honest answers to the ten we hear most often on WhatsApp support.' },
      { type: 'h2', text: 'Price, license and delivery' },
      { type: 'list', items: [
        'How many bots are there, and what do they cost? Five Expert Advisors, priced from $200 to $1,000 — see the Trading Bots page for the current lineup.',
        'Is the license lifetime or a subscription? Lifetime. One payment, no monthly fees.',
        'Can someone copy my bot? No. Every EA is licensed to your MT5 account number only; on any other account it will not trade.',
        'How do I receive the bot? As a download from your order page plus a copy by email.',
        'How does payment verification work? You share your payment slip with your email, phone and WhatsApp number. Our system cross-checks the name, transaction ID and amount — a full match is approved automatically; an unclear slip just gets re-uploaded.',
      ] },
      { type: 'h2', text: 'Setup and compatibility' },
      { type: 'list', items: [
        'Which platform do the bots run on? MetaTrader 5. Copy the .ex5 file into MQL5 → Experts, tick "Allow Algo Trading", and load the recommended settings from the setup guide.',
        'Do you help with setup? Yes — every bot has an Urdu setup video, and our WhatsApp support answers from a real person.',
        'I changed my broker or account number. What now? Message support and we will re-issue your license for the new account number.',
      ] },
      { type: 'h2', text: 'Expectations and risk' },
      { type: 'list', items: [
        'Do the product videos show real profits? Every video on this site is demo footage — we never publish fake profit screenshots or guaranteed-return claims.',
        'Will the bot always make money? No bot can promise that. Markets carry risk, drawdowns are part of every real system, and our guides tell you to test on demo or a cent account first.',
      ] },
      { type: 'p', text: 'Still unsure which tier fits you? Message us on WhatsApp and describe your account size and experience — we will point you to the right bot, even if it is the cheapest one.' },
    ],
  },

];

export function postsFor(blog: BlogKind): BlogPost[] {
  return BLOG_POSTS.filter((p) => p.blog === blog).sort((a, b) =>
    b.date.localeCompare(a.date),
  );
}

export function findPost(blog: BlogKind, slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.blog === blog && p.slug === slug);
}
