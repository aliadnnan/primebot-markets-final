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

  {
    blog: 'trading',
    slug: 'drawdown-explained-trading-survival',
    title: 'Drawdown Explained: The Metric That Decides Whether a Strategy Survives',
    excerpt:
      'Profit figures get all the attention, but drawdown tells you the truth about risk. Here is what it means, how it is calculated, and the levels honest traders respect.',
    category: 'Risk Management',
    date: '2026-10-22',
    readMins: 6,
    content: [
      { type: 'p', text: 'Every strategy has winning streaks and losing streaks. Drawdown measures how deep the losing streaks go: the percentage (or amount) an account falls from its highest balance before recovering. Two traders can both make 10% in a year, but if one suffered a 60% drawdown to get there, their journeys — and the risk they took — were completely different.' },
      { type: 'h2', text: 'How drawdown is calculated' },
      { type: 'p', text: 'Start at the highest point your account balance (or equity) has reached — the peak. Then find the lowest point after that peak before a new high is made — the trough. The drop from peak to trough, divided by the peak, is the drawdown. A $1,000 account that rises to $1,200 and then falls to $900 has a drawdown of 25% — from the $1,200 peak, not from the starting balance.' },
      { type: 'h2', text: 'Balance drawdown vs. floating drawdown' },
      { type: 'list', items: [
        'Balance drawdown only counts closed trades — the official statement of what happened.',
        'Floating (equity) drawdown includes open trades — what your account is experiencing right now. A basket of open positions can show a large floating drawdown even while the closed balance looks fine.',
        'Honest strategy evaluations always consider floating drawdown: it is the pain you actually had to endure.',
      ] },
      { type: 'h2', text: 'What counts as an acceptable drawdown?' },
      { type: 'list', items: [
        'Under 10%: conservative. Comfortable to trade through, suitable for larger accounts.',
        '10–25%: moderate. Normal for many real systems; requires discipline to ride out.',
        'Above 30%: aggressive territory. The account needs large gains just to break even, and one bad month can wipe it out.',
        'No number is "safe" on its own — a 15% drawdown on a 0.01 lot per $1,000 account is a different plan than the same percentage on an oversized account.',
      ] },
      { type: 'h2', text: 'Using drawdown in your own trading' },
      { type: 'list', items: [
        'Decide your maximum acceptable drawdown before you start — for example 20% — and stop or scale down if it is reached.',
        'Test any strategy (manual or automated) on demo or a cent account long enough to see a full drawdown cycle, not just the good weeks.',
        'Never increase position size after a drawdown to "get it back" — that is how small drawdowns become account-killing ones.',
      ] },
      { type: 'p', text: 'Profit is what you take; drawdown is what you pay. A strategy you can describe in drawdown terms is a strategy you actually understand — and the only kind worth trading with real money.' },
    ],
  },

  {
    blog: 'sales',
    slug: 'news-filter-protects-your-trades',
    title: 'The News Filter: How PrimeBots Pause Trading Around Major News Releases',
    excerpt:
      'CPI, NFP and FOMC can move gold $30 in minutes. Here is how the PrimeBot news filter pauses new entries around high-impact releases — and why that protection matters.',
    category: 'Product News',
    date: '2026-10-22',
    readMins: 5,
    content: [
      { type: 'p', text: 'Most blown accounts do not fail on ordinary days. They fail on news days — when a single economic release moves the market faster than any strategy was designed for. That is why every PrimeBot in the lineup carries a built-in news filter that pauses new entries around high-impact events.' },
      { type: 'h2', text: 'Why news releases are dangerous for automated trading' },
      { type: 'list', items: [
        'Price gaps: the market can jump over your stop level, filling you far worse than planned.',
        'Spreads widen: costs spike exactly when you want to enter or exit.',
        'Whipsaws: the first move after a release is often reversed within minutes, trapping both directions.',
        'A strategy tested on normal conditions was never designed for these 10-minute chaos windows.',
      ] },
      { type: 'h2', text: 'Which events it watches' },
      { type: 'p', text: 'The default list covers the releases that historically move gold and major pairs the hardest: US Non-Farm Payrolls, CPI inflation data, FOMC rate decisions and press conferences, plus central-bank decisions from the major currencies. These are the moments when "normal" market behaviour goes out of the window — which is exactly when a pause costs nothing and protection is worth the most.' },
      { type: 'h2', text: 'How the filter works' },
      { type: 'list', items: [
        'The bot reads a list of high-impact events (NFP, CPI, FOMC rate decisions and similar releases).',
        'A configurable number of hours before each event, it stops opening new trades — existing positions keep managing normally with their own take-profits and stop-losses.',
        'After the release, the filter waits until volatility settles before allowing new entries again.',
        'The window is adjustable, so you can make it stricter or looser to match your risk comfort.',
      ] },
      { type: 'h2', text: 'An honest note' },
      { type: 'p', text: 'The news filter reduces a specific, well-documented risk — it does not remove risk. Markets can still gap, spreads can still widen, and no filter can protect against every surprise event. Like every PrimeBot feature, it is a tool for disciplined trading, not a promise of safety or profit.' },
      { type: 'p', text: 'The setup video for your bot shows exactly where to find the news filter settings and how to adjust the pause windows. If you are unsure what settings fit your account, our WhatsApp support will walk you through them.' },
    ],
  },

  {
    blog: 'trading',
    slug: 'trading-sessions-explained',
    title: 'Trading Sessions Explained: When Gold and Forex Actually Move',
    excerpt:
      'Forex trades 24 hours a day — but the market is not the same market at every hour. How the Asian, London and New York sessions work, and which hours suit your strategy.',
    category: 'Trading Basics',
    date: '2026-10-23',
    readMins: 6,
    content: [
      { type: 'p', text: 'Gold and forex trade around the clock, five days a week. That tempts beginners to trade whenever they feel like it — morning, midnight, lunch break. But the market is not the same market at every hour. Volume, volatility and spreads change dramatically as the world’s financial centres open and close, and your results change with them.' },
      { type: 'h2', text: 'The three major sessions' },
      { type: 'list', items: [
        'Asian session (Tokyo): roughly 4:00 a.m. to 1:00 p.m. Pakistan time. The quietest session — ranges are narrow, gold often drifts sideways, and spreads can be a little wider.',
        'London session: roughly 12:00 p.m. to 9:00 p.m. Pakistan time. The heaviest volume of the day. Gold wakes up here — most of its daily range is built during these hours.',
        'New York session: roughly 5:30 p.m. to 2:30 a.m. Pakistan time. It carries London’s momentum and hosts all the big US economic releases — CPI, NFP, Fed announcements.',
      ] },
      { type: 'h2', text: 'The overlap hours are the golden hours' },
      { type: 'p', text: 'From about 5:30 p.m. to 9:00 p.m. Pakistan time, London and New York are open at the same time. This overlap is the busiest stretch of the trading day: spreads are at their tightest, trends move with conviction, and most intraday strategies get their best signals here. If you can only watch the market for a few hours a day, make it these.' },
      { type: 'h2', text: 'News lands inside the New York session' },
      { type: 'p', text: 'The releases that move gold $20–$40 in minutes — US inflation data, jobs reports, Federal Reserve decisions — almost all arrive during New York hours. In the minutes around a release, spreads widen sharply and prices can gap past stop losses. Many experienced traders simply close or pause positions for 15–30 minutes around the release, then trade the cleaner move that follows.' },
      { type: 'h2', text: 'Match the session to your style' },
      { type: 'list', items: [
        'Scalpers and day traders: focus on the London–New York overlap, where the movement justifies the effort.',
        'Beginners: avoid trading gold during the thin Asian hours, when a quiet market can lull you into oversized positions that suddenly wake up in London.',
        'Swing traders: session timing matters less, but place entries during liquid hours so you get fair fills.',
        'EA users: check that your bot pauses new entries around high-impact news — automated systems trade the calendar, not the clock, and the news filter is what keeps them out of the chaos windows.',
      ] },
      { type: 'p', text: 'The market rewards traders who respect its rhythm. Trade when the market is actually breathing, size for the session’s normal movement, and let the quiet hours be your time to study — not your time to force trades.' },
    ],
  },

  {
    blog: 'sales',
    slug: 'which-primebot-is-right-for-you',
    title: 'Which PrimeBot Is Right for You? A Tier-by-Tier Buying Guide',
    excerpt:
      'Five bots, $200 to $1,000 — the differences are real but the right choice depends on your account size and experience, not the price tag. A plain-language guide.',
    category: 'Buying Guide',
    date: '2026-10-23',
    readMins: 6,
    content: [
      { type: 'p', text: 'Five Expert Advisors, priced from $200 to $1,000. The natural question is: which one should I buy? The honest answer is that it depends far more on your account size and your experience than on the price tag. Here is how to think about it.' },
      { type: 'h2', text: 'Start with your account size' },
      { type: 'list', items: [
        'Small accounts (a few hundred dollars or a cent account): the starter tier. It runs the core strategy with conservative defaults that respect a small balance.',
        'Mid-size accounts: the middle tiers, which add the protections a growing account needs — news-time entry pauses, daily targets and basket management.',
        'Larger accounts: the flagship tier, with the full strategy stack and the most conservative default risk settings.',
      ] },
      { type: 'h2', text: 'Then match your experience' },
      { type: 'list', items: [
        'Never used an EA before? The starter tier plus our Urdu setup videos is the intended on-ramp.',
        'Already run automated systems? A mid tier gives you the protection features experienced traders ask for.',
        'Want the most hands-off setup with priority support? That is what the flagship tier is for.',
      ] },
      { type: 'h2', text: 'What does not change between tiers' },
      { type: 'list', items: [
        'Lifetime license — one payment, no monthly fees, on every tier.',
        'Account-number lock: whichever bot you buy works on your MT5 account only, so your purchase cannot be copied.',
        'Honest demos: every product video on this site is real demo footage. No tier comes with fake profit screenshots.',
        'Urdu video guides and WhatsApp support from a real person — the same for a $200 buyer and a $1,000 buyer.',
      ] },
      { type: 'h2', text: 'The rule that matters most' },
      { type: 'p', text: 'Never buy the most expensive tier just because it costs more. A $200 bot run correctly on a demo or cent account, with settings you understand, beats a $1,000 flagship run blindly on a live account. Price buys features and convenience — it does not buy profit. Test on demo first, learn the bot’s rhythm, and scale only when you understand how it behaves in a drawdown.' },
      { type: 'p', text: 'Still deciding? Message us on WhatsApp with your account size and experience and we will point you to the right tier — even if it is the cheapest one.' },
    ],
  },

  {
    blog: 'trading',
    slug: 'support-resistance-levels-explained',
    title: 'Support and Resistance Explained: The Invisible Levels That Shape Every Chart',
    excerpt:
      'Prices stall, bounce and break at the same zones again and again. What support and resistance really are, why they work, and three practical ways beginners use them.',
    category: 'Trading Basics',
    date: '2026-10-24',
    readMins: 6,
    content: [
      { type: 'p', text: 'Every trader has watched it happen: gold falls to the same price three times in a week, and each time it bounces as if the market remembers something. Then one day it slices through that level without a pause. Those prices are support and resistance — the zones where buying and selling pressure meet — and learning to spot them changes how you read every chart, whatever you trade.' },
      { type: 'h2', text: 'What support and resistance actually are' },
      { type: 'list', items: [
        'Support: a price zone where buying interest has repeatedly outweighed selling, stopping declines — the market’s “floor”.',
        'Resistance: the opposite — a zone where selling has repeatedly capped rallies, the market’s “ceiling”.',
        'Round numbers act as magnets: 2,900 or 3,000 on gold, 1.1000 on a currency pair — traders place orders there because they are easy to remember.',
        'Previous highs and lows: last month’s peak becomes resistance when price returns; the pullback low becomes support.',
        'Trendlines and moving averages: in a steady uptrend, the rising trendline and a 50-period moving average often act as moving support.',
      ] },
      { type: 'h2', text: 'Why the same levels keep working' },
      { type: 'p', text: 'Part of it is memory. Traders who missed a bounce off a level last week place their orders at the same price this week — and thousands of stop-loss and take-profit orders sit there too. The other part is honesty about limits: no level holds because a line was drawn. Levels work until the balance of buyers and sellers changes, and then they break. Treat them as probability zones, not walls.' },
      { type: 'h2', text: 'Three practical ways beginners use levels' },
      { type: 'list', items: [
        'Plan entries at support, not in mid-air: buying near a tested support with a stop just below it gives you a clear line for being wrong.',
        'Respect resistance: taking a buy trade right under a strong resistance is swimming toward a dam — either wait for the break or skip the trade.',
        'Remember the flip: when resistance breaks and holds, it often becomes support — the breakout level becomes the pullback level. The same applies in reverse.',
        'Look left: the most reliable levels are the ones with several touches over weeks or months, not a level that formed this morning.',
      ] },
      { type: 'p', text: 'One caution that saves money: levels are zones a few dollars wide on gold, not razor lines. A brief spike through support that immediately closes back above it is normal — professionals call it a wick, and beginners call it a reason to panic. Give levels a little room, practise spotting them on a demo or cent account for a few weeks, and never trust a level so much that you skip your stop loss.' },
    ],
  },

  {
    blog: 'sales',
    slug: 'demo-to-live-safe-path-first-bot',
    title: 'From Demo to Live: The Safe Path to Running Your First Bot',
    excerpt:
      'Demo first, then a cent account, then live — small. What each stage of the journey is for, how long to spend in it, and the checks that matter most.',
    category: 'Setup Guide',
    date: '2026-10-24',
    readMins: 6,
    content: [
      { type: 'p', text: 'The fastest way to lose faith in a trading bot is to switch it on with real money on day one, size it wrong, and meet a drawdown you never knew it had. There is a safer path, and every honest EA seller should tell you to take it: demo first, then a cent account, then live — small. Here is what each stage is for and how long to spend in it.' },
      { type: 'h2', text: 'Stage 1 — Demo: learn the machine' },
      { type: 'list', items: [
        'Run the bot on a demo account for two to four weeks with the recommended settings from your setup video.',
        'Watch full trade cycles: how it opens, how it manages a basket, how it behaves around news — including its losing days.',
        'Open the Experts and Journal tabs in MT5 when anything surprises you; the messages there explain what the bot decided and why.',
        'Test the protections: the news filter, the daily target and the maximum drawdown settings. Demo is the place to learn where the off-switches are.',
      ] },
      { type: 'h2', text: 'Stage 2 — Cent account: real money, tiny risk' },
      { type: 'p', text: 'Demo trading has one weakness: it teaches nothing about your emotions, because nothing is really at stake. A cent account fixes that. The bot runs the identical strategy, but a 5,000-cent deposit means mistakes cost cents instead of dollars — and you still feel every one of them. This is where you learn your real tolerance for drawdowns: if a 20% floating drawdown on cents makes you switch the bot off, your settings are too aggressive, not your nerves too weak. Run a full month here before moving on.' },
      { type: 'h2', text: 'Stage 3 — Live: small and slow' },
      { type: 'list', items: [
        'Start live with a fraction of your planned capital — treat the first live month as a paid exam, not an income stream.',
        'Change nothing else: the same settings and risk parameters that survived the cent stage.',
        'Review weekly, not hourly. Bots need time; watching every tick leads to mid-drawdown setting changes that break the strategy you paid for.',
        'Withdraw your first profit. It proves the delivery and payout pipeline works — and it keeps some of your money out of the market’s reach.',
      ] },
      { type: 'p', text: 'No stage of this process changes one fact: trading carries risk, and no bot can promise profit. Demo footage in our product videos shows what the bot does — it never shows what you will earn. The demo-to-live path exists so you discover exactly how the bot behaves while the tuition is cheap. If you want help setting up any stage, our WhatsApp support answers from a real person, and every bot has an Urdu setup video that walks through it screen by screen.' },
    ],
  },

  {
    blog: 'trading',
    slug: 'trading-psychology-revenge-trading',
    title: 'Trading Psychology: How to Stop Revenge Trading Before It Blows Your Account',
    excerpt:
      'One loss becomes three, then ten — not because the strategy failed, but because the trader did. What revenge trading is, why every trader does it, and the practical rules that break the cycle.',
    category: 'Trading Psychology',
    date: '2026-10-25',
    readMins: 6,
    content: [
      { type: 'p', text: 'Every trader knows the moment. A trade stops out, the frustration rises, and within minutes you are back in the market — bigger size, no plan, chasing the loss. Traders call it revenge trading, and it has destroyed more accounts than any bad strategy ever will. It is not a strategy problem. It is a psychology problem, and it has a practical fix.' },
      { type: 'h2', text: 'What revenge trading actually looks like' },
      { type: 'list', items: [
        'Re-entering the same market immediately after a loss, without a fresh setup, just to "get it back".',
        'Increasing lot size after a loss so one win can erase the damage — and often doubling the damage instead.',
        'Moving a stop loss further away because closing at a loss feels worse than risking more.',
        'Trading outside your planned hours or sessions because the loss happened "too early" to stop for the day.',
      ] },
      { type: 'h2', text: 'Why your brain does this' },
      { type: 'p', text: 'A loss feels roughly twice as painful as an equal-sized win feels good — psychologists call this loss aversion. After a loss, the brain treats the money as "stolen" and demands it back immediately, shutting down the slow, careful thinking that your trading plan was built with. Add a live chart ticking in front of you, and the urge to click becomes almost physical. Knowing this does not make you immune — but it does mean the fix must be structural, not willpower-based. You cannot out-think a feeling in the moment; you have to decide the rules before the moment arrives.' },
      { type: 'h2', text: 'Four rules that break the cycle' },
      { type: 'list', items: [
        'The two-loss rule: after two losing trades in a day, stop trading for at least two hours — or for the day. Write it into your plan before you open the platform.',
        'A hard daily loss cap: decide a number (for example 3% of your balance) and treat hitting it as a circuit breaker, not a suggestion. Close the platform when it trips.',
        'Fixed size, no exceptions: your lot size comes from your plan, never from your mood. A loss never justifies a bigger next trade.',
        'A cooling-off journal: after any loss, write one line — what happened, what you felt, what the plan says next. The act of writing forces the slow brain back into charge.',
      ] },
      { type: 'p', text: 'Step away from the screen after a loss, review the trade against your plan, and ask one question: was it a good trade that lost, or a bad trade that deserved to lose? Good trades lose all the time — that is normal trading, and no revenge is owed. Bad trades are the ones to study, not to repeat. If you run an automated system, the same discipline applies: do not change its settings mid-drawdown, because the worst setting changes in trading history were all made in the hour after a loss. Revenge trading feels like fighting back; in reality it is giving the market a second, bigger chance to take your money. The traders who survive are not the ones who never lose — they are the ones who lose, stop, and come back tomorrow with the same plan intact.' },
    ],
  },

  {
    blog: 'sales',
    slug: 'primebot-settings-explained-before-going-live',
    title: 'PrimeBot Settings Explained: The 5 Settings Every Buyer Should Understand Before Going Live',
    excerpt:
      'Lot size, daily target, drawdown stop, news filter and basket management — what each PrimeBot setting actually does, and how to choose sensible values for your account.',
    category: 'Product Guide',
    date: '2026-10-25',
    readMins: 6,
    content: [
      { type: 'p', text: 'Open any PrimeBot on MetaTrader 5 and you will see a settings window full of numbers. Most buyers leave them exactly as they arrive — which is fine, because the defaults are conservative — but understanding the five settings that matter most is the difference between running a bot and understanding your bot. Here they are, in plain language.' },
      { type: 'h2', text: 'The five settings at a glance' },
      { type: 'list', items: [
        'Lot size: how big each trade is, and therefore how much each price move is worth.',
        'Daily target: the profit level at which the bot stops opening new trades until tomorrow.',
        'Drawdown stop: the emergency brake that pauses trading if your account falls a set amount from its peak.',
        'News filter: the pause around high-impact releases like CPI, NFP and FOMC decisions.',
        'Basket management: how groups of trades are closed together at a combined profit target.',
      ] },
      { type: 'h2', text: 'Lot size and daily target' },
      { type: 'p', text: 'Lot size decides how much money each price move is worth. On gold, a 0.01 lot moves roughly $1 per $1 of price change on a standard account, and one hundredth of that on a cent account. Smaller lots mean smaller wins and smaller losses — and a much longer runway before a drawdown hurts. The rule our guides repeat: size for the account you actually have, not the account you wish you had. The daily target works the other way: it is the profit level at which the bot stops for the day, because the most dangerous trades of the day are usually the ones taken after a good day, when confidence runs high. Remember the cent-account rule: on a cent account, targets are entered in cents — a $20 daily goal is entered as 2000. Getting this unit wrong is the single most common setup mistake, and our setup videos show exactly where to check it.' },
      { type: 'h2', text: 'Drawdown stop, news filter and baskets' },
      { type: 'p', text: 'The drawdown stop is the fire exit: you hope never to use it, but you would never run a building without one. Set it before you go live, not during a drawdown — in the middle of a losing run, every trader talks themselves out of protection they set up calmly weeks earlier. The news filter pauses new entries for a configurable window around high-impact releases, while existing trades keep managing normally; beginners should leave the default window alone until they have watched a full month of news days. Basket management controls how groups of trades close together at a combined take-profit: the key idea is that a basket target is a goal for the group, not a promise per trade — individual trades inside a basket will often be in loss while the basket as a whole is managed toward its target.' },
      { type: 'p', text: 'One final rule covers all five settings: change one thing at a time, and test the change on demo or a cent account first. A bot whose settings you understand — and whose drawdowns you have actually watched — is a bot you will keep running. If any setting still confuses you, message our WhatsApp support or rewatch your bot’s Urdu setup video; a real person will walk you through it.' },
    ],
  },

  {
    blog: 'trading',
    slug: 'moving-averages-explained-trend-indicator',
    title: 'Moving Averages Explained: The Trend Indicator Every Beginner Should Understand',
    excerpt:
      'One line on the chart that smooths out the noise and shows the trend. What moving averages are, how SMA and EMA differ, and how beginners use them without overcomplicating their trading.',
    category: 'Indicators',
    date: '2026-10-26',
    readMins: 6,
    content: [
      { type: 'p', text: 'Open any chart in MetaTrader 5 and add a moving average, and a smooth line appears, following the price like a shadow. It is the simplest indicator in trading — and the one beginners misunderstand most often. A moving average does not predict the future. It summarises the past, so you can see the trend instead of the noise.' },
      { type: 'h2', text: 'What a moving average actually is' },
      { type: 'p', text: 'A moving average takes the closing prices of the last N periods and averages them into a single value, plotted as a line that updates with every new candle. A 50-period moving average on a daily chart averages the last 50 days; on an hourly chart, the last 50 hours. When the price sits above its moving average, the recent trend has been up. When it sits below, the recent trend has been down. That is the whole idea — a trend made visible.' },
      { type: 'h2', text: 'SMA vs. EMA: the two types that matter' },
      { type: 'list', items: [
        'Simple moving average (SMA): every period counts equally. Steady and slow to react — useful for the big picture, like a 200-period average for the long-term trend.',
        'Exponential moving average (EMA): recent prices count more than old ones. It reacts faster to new moves, which day traders often prefer — but it also gives more false signals in sideways markets.',
        'Neither is "better". The SMA is a slow, calm guide; the EMA is a quicker, jumpier one. Choose by your timeframe, then stick with it instead of switching every week.',
      ] },
      { type: 'h2', text: 'How beginners actually use them' },
      { type: 'list', items: [
        'Direction filter: only look for buys when price is above the moving average, only for sells when it is below. One rule, applied consistently, removes half of all bad trades.',
        'Two averages together: a fast average (for example 20) crossing above a slow one (for example 50) is called a golden cross; the reverse is a death cross. Treat crossings as trend hints, not buy buttons.',
        'Dynamic support and resistance: in a steady uptrend, price often pulls back to its moving average and bounces. Traders watch that zone for entries — with a stop loss below it, in case the bounce fails.',
      ] },
      { type: 'p', text: 'One warning completes the picture. In a sideways market, price whipsaws across the average again and again, and every crossing looks like a signal that reverses the next day — a trend tool cannot work when there is no trend, so the honest read is "no trend" and the correct action is usually no trade at all. Put a single 50-period EMA on your chart and watch it for two weeks on demo or a cent account: notice when it keeps you on the right side of a trend, and when it misleads you in a range. Combine it with the basics that never change — a stop loss on every trade, risk of 1% or less, and no trading around major news releases. Indicators support a plan; they never replace one.' },
    ],
  },

  {
    blog: 'sales',
    slug: 'primebot-after-sales-support-what-to-expect',
    title: 'After You Buy a PrimeBot: The Support, Updates and Setup Help You Actually Get',
    excerpt:
      'Buying the bot is step one. What happens next — setup help in Urdu, lifetime updates, license re-issues and real-person WhatsApp support — explained before you order.',
    category: 'Product News',
    date: '2026-10-26',
    readMins: 6,
    content: [
      { type: 'p', text: 'Most trading-bot sellers disappear the moment the payment clears. That is exactly when a buyer needs help most — the file is downloaded, MetaTrader is open, and something does not look right. PrimeBot Markets is built the other way round: the purchase includes the support that gets the bot running and keeps it running, for the life of the license.' },
      { type: 'h2', text: 'Setup help comes first' },
      { type: 'list', items: [
        'Every bot has an Urdu setup video that walks through the installation screen by screen — copying the file into MQL5 and Experts, ticking "Allow Algo Trading", and loading the recommended settings.',
        'If you get stuck, message our WhatsApp support with a screenshot of the problem — especially the Experts or Journal tab in MT5, which usually names the exact issue.',
        'A real person answers. Support is not a chatbot, and it is not a ticket queue that replies in three days.',
      ] },
      { type: 'h2', text: 'Lifetime updates, and changing your account' },
      { type: 'p', text: 'Your license is lifetime, and that includes updates to the bot you bought: when a strategy or protection feature is improved, existing owners receive the updated build with no new payment and no monthly fee, licensed to the same MT5 account number. Traders change brokers too, and when that happens the license does not die with the old account — message support with your new MT5 account number and we will re-issue it. Send the number carefully, digit by digit: the lock checks the exact number, and a single wrong digit is the most common reason a re-issued bot refuses to trade.' },
      { type: 'h2', text: 'How to get the fastest answer' },
      { type: 'list', items: [
        'Say which bot you bought and which account it is licensed to.',
        'Send a screenshot of the MT5 Experts or Journal tab — the messages there explain almost every problem.',
        'Say what you changed last. Nine out of ten support cases trace back to one setting changed mid-drawdown or one missed permission tick.',
      ] },
      { type: 'p', text: 'Support can fix installation, settings and licensing, and explain how a feature works. It cannot promise profit, recover losses, or change how the market behaves — no honest seller can. What it can do is make sure the tool you paid for runs correctly on your account, with settings you understand, so your results reflect the strategy and your risk choices — not a setup mistake nobody helped you fix. That is the deal in one line: one payment, lifetime license, Urdu setup videos, and a real person on WhatsApp when you need one.' },
    ],
  },

  {
    blog: 'trading',
    slug: 'rsi-explained-relative-strength-index',
    title: 'RSI Explained: How the Relative Strength Index Helps Traders Read Momentum',
    excerpt:
      'One number between 0 and 100 that shows whether recent price moves have been unusually strong or weak. What RSI is, how the 70 and 30 levels work, and the mistakes beginners make with it.',
    category: 'Indicators',
    date: '2026-10-27',
    readMins: 6,
    content: [
      { type: 'p', text: 'Add the Relative Strength Index to a chart and a line appears in a panel below the price, bouncing between 0 and 100. It is one of the most popular indicators in trading, and one of the most misread. RSI does not tell you what the price will do next. It measures momentum: how strong the recent moves have been compared with recent pullbacks, so you can judge whether a move is stretched or still has room. Published by J. Welles Wilder in 1978, it uses a standard setting of 14 periods, comparing the average size of up moves with down moves over those candles and converting the ratio into a number from 0 to 100.' },
      { type: 'h2', text: 'The 70 and 30 levels' },
      { type: 'list', items: [
        'Above 70 is called overbought: buyers have pushed hard, and the move may be due a pause or pullback. It is a warning flag, not an automatic sell signal.',
        'Below 30 is called oversold: sellers have pushed hard, and the move may be due a bounce. Again, a warning flag, not an automatic buy signal.',
        'Between 30 and 70 is the middle ground, where most normal price action lives. Crossings of the 50 line are often read as a shift in momentum from one side to the other.',
        'The trap: in a strong trend, RSI can stay overbought or oversold for days or weeks. Selling gold just because RSI passed 70 during a powerful uptrend is one of the classic ways beginners fight the market.',
      ] },
      { type: 'h2', text: 'Divergence: the signal experienced traders watch' },
      { type: 'p', text: 'Divergence happens when the price and RSI disagree. If gold makes a new high but RSI makes a lower high, the buying momentum is weakening even though the price is still rising. If gold makes a new low but RSI makes a higher low, selling momentum is fading. Divergence does not time the turn precisely, but it tells you the trend is tired, which is exactly when a careful trader tightens risk instead of adding size.' },
      { type: 'h2', text: 'Three mistakes to avoid' },
      { type: 'list', items: [
        'Trading RSI alone: one indicator is never a strategy. Pair it with the trend, a support or resistance level, and the economic calendar.',
        'Treating every crossing as a trade: RSI crosses 70 and 30 often, especially in sideways markets, and most of those crossings reverse quickly.',
        'Ignoring the news: no indicator protects a position through a CPI or FOMC release. Check the calendar first, trade second.',
      ] },
      { type: 'p', text: 'Use RSI the way it was designed to be used: as a momentum gauge that supports a plan, not as a plan by itself. Watch it for two weeks on a demo or cent account alongside a moving average, notice when overbought readings mark a real pause and when a strong trend ignores them completely, and keep the rules that never change — a stop loss on every trade, risk of 1% or less, and no trading around major news releases.' },
    ],
  },

  {
    blog: 'sales',
    slug: 'primebot-vps-setup-guide',
    title: 'Running Your PrimeBot on a VPS: Why Traders Use One and How to Set It Up',
    excerpt:
      'A trading bot only trades while MetaTrader is running. How a VPS keeps your PrimeBot online around the clock through power cuts, restarts and travel — and how to set one up step by step.',
    category: 'Guides',
    date: '2026-10-27',
    readMins: 6,
    content: [
      { type: 'p', text: 'An Expert Advisor only works while MetaTrader 5 is open and connected. Close the laptop, lose the internet, or let the computer sleep, and the bot stops with it — which means it can miss the trade it was built to take. That is why many bot owners run their PrimeBot on a VPS, a virtual private server: a computer in a data centre that stays online around the clock, so the bot keeps running even when your own computer is off.' },
      { type: 'p', text: 'A VPS is a small Windows computer rented by the month, sitting in a professional data centre with backup power and a fast, stable internet connection. You connect to it from your own computer or phone with a remote desktop app, and it looks and behaves like an ordinary Windows desktop. You install MetaTrader 5 on it, attach your PrimeBot, and then disconnect — the VPS keeps running, and so does the bot.' },
      { type: 'h2', text: 'Why traders use one for a bot' },
      { type: 'list', items: [
        'Power cuts and load shedding: your home power can fail, but a data centre has generators. The bot never notices.',
        'Internet drops: a home connection can drop for minutes at a time, exactly when a trade is managed. A data centre connection is far more stable.',
        'Laptop sleep and restarts: a laptop that sleeps, updates or restarts overnight stops the bot. A VPS does not sleep.',
        'Travel: you can check the bot from your phone from anywhere, without carrying a laptop that must stay on.',
      ] },
      { type: 'h2', text: 'Setting it up, step by step' },
      { type: 'list', items: [
        'Choose a Windows VPS with at least 2 GB of RAM, ideally in a data centre near your broker server location, so the connection between the VPS and the broker is as fast as possible.',
        'Connect with the remote desktop app, download MetaTrader 5 from your broker, and log in to the same account your PrimeBot license is locked to.',
        'Copy the PrimeBot file into the MQL5 and Experts folder, attach it to the chart, tick Allow Algo Trading, and load the recommended settings.',
        'Check the Experts and Journal tabs for errors, then disconnect from the remote desktop without logging off or shutting down — disconnecting leaves everything running.',
        'Check in once a day from your phone or computer. A VPS still needs a human eye: updates, broker maintenance and the occasional restart are part of owning a bot.',
      ] },
      { type: 'h2', text: 'What a VPS does not do' },
      { type: 'p', text: 'A VPS changes where the bot runs, not how it trades. It does not improve a strategy, reduce risk, or guarantee any result — it simply removes the downtime that comes from running a bot on a home computer. It also costs a small monthly fee, separate from the bot itself, so compare providers on uptime and support rather than picking the cheapest option and hoping. If you are unsure about any step, message PrimeBot support on WhatsApp with a screenshot of where you are stuck, and mention that you are setting up a VPS: the setup help that comes with your license covers exactly this, and a bot that runs on a stable VPS with the right settings is a bot whose results reflect the strategy and your risk choices, not a power cut nobody saw coming.' },
    ],
  },

  {
    blog: 'trading',
    slug: 'stop-loss-explained-where-to-place-it',
    title: 'Stop Loss Explained: Where Traders Place It and Why It Matters',
    excerpt:
      'A stop loss is the one order that protects your account when a trade goes wrong. What it is, where beginners place it, and the mistakes that turn a small loss into a big one.',
    category: 'Risk Management',
    date: '2026-10-28',
    readMins: 6,
    content: [
      { type: 'p', text: 'Every trade has two possible exits: the one you planned and the one the market forces on you. A stop loss is the planned one. It is an order that closes your position automatically if the price reaches a level you chose in advance, so a single bad trade cannot keep running until it damages your account. Professional traders treat the stop loss as part of the trade itself, not as an optional extra: the entry, the stop and the target are decided together, before the trade is opened, when your judgement is still calm.' },
      { type: 'h2', text: 'What a stop loss actually does' },
      { type: 'list', items: [
        'It caps the loss on one trade at a known amount, so you never have to watch a losing position and hope it comes back.',
        'It removes the hardest decision in trading — when to admit a trade is wrong — by making that decision in advance.',
        'It protects you when you are away from the screen, asleep, or caught by a sudden news move that you cannot react to in time.',
        'It does not guarantee the exact exit price: in a fast gap or a news spike, the fill can be worse than the stop level, which is why position size still matters.',
      ] },
      { type: 'h2', text: 'Where beginners place it' },
      { type: 'p', text: 'A stop loss belongs where your trade idea stops being true. For a buy, that is usually just below a support level or a recent swing low; for a sell, just above resistance or a recent swing high. If the price breaks through that level, the reason you entered is gone, and staying in is no longer trading your plan — it is hoping. Placing the stop by how much money you are willing to lose, instead of by the chart, is the classic beginner error: a stop ten pips away on gold will be hit by ordinary noise, and a stop that is far too wide turns every loss into an account event. The chart sets the distance; your position size sets the money at risk. If the chart distance would risk more than 1% of your account, trade smaller — never move the stop to fit the size.' },
      { type: 'h2', text: 'Three mistakes to avoid' },
      { type: 'list', items: [
        'Moving the stop further away when a trade goes against you: that converts a planned small loss into an open-ended one, and it is how accounts are lost.',
        'Removing the stop entirely during a news release: volatility can move gold tens of dollars in a minute, far faster than anyone can react by hand.',
        'Placing the stop exactly on a round number or an obvious level, where thousands of other stops cluster and price often spikes briefly before reversing.',
      ] },
      { type: 'p', text: 'Test your stop placement on a demo or cent account for two weeks before trusting it with real size. Note every stop-out: was the idea genuinely wrong, or did normal noise take you out before the move happened? The pattern in those notes tells you whether your stops are too tight, too loose, or in the right place. A good stop does not make you right more often — it makes being wrong cheap, repeatable and survivable, which is the only way a trading account lasts long enough to learn anything at all.' },
    ],
  },

  {
    blog: 'sales',
    slug: 'updating-your-primebot-new-versions-guide',
    title: 'Updating Your PrimeBot: How New Versions, Settings and Reinstalls Work',
    excerpt:
      'Bots get updates like any software. How PrimeBot version updates reach you, what happens to your settings, and how a clean reinstall works if anything goes wrong.',
    category: 'Guides',
    date: '2026-10-28',
    readMins: 6,
    content: [
      { type: 'p', text: 'A trading bot is software, and software gets updated: a bug is fixed, a feature is added, or a broker changes something that the bot must adapt to. If you own a PrimeBot, updates are part of the lifetime license, and knowing how they work saves you from the two most common worries — losing your settings, or running an old version long after a fix exists. This guide covers how updates arrive, what to check after installing one, and how a reinstall works if your setup ever breaks.' },
      { type: 'h2', text: 'How you receive an update' },
      { type: 'list', items: [
        'New versions are sent to existing owners through the same channel you bought from — usually WhatsApp or email — with a short note on what changed and whether the update is recommended for everyone or only for certain accounts.',
        'An update is a new bot file, not a patch: you receive the latest version of the file, and you replace the old one in your MetaTrader Experts folder.',
        'Your license does not change with an update. The account-number lock stays tied to the same trading account, so an update never asks you to pay again or re-verify your purchase.',
        'If you are unsure whether a message about an update is genuine, check it with PrimeBot support before installing anything — never install a bot file sent by an unknown contact.',
      ] },
      { type: 'h2', text: 'What happens to your settings' },
      { type: 'p', text: 'Replacing the bot file does not automatically erase your chart setup, but it is good practice to treat every update as a fresh attach: remove the old bot from the chart, place the new file in the Experts folder, restart MetaTrader, and attach the new version. Before you do that, save your current settings with the Save button in the bot inputs window, so you can reload them on the new version in seconds. After attaching, check three things before anything else: the license account still matches, the inputs loaded are the ones you saved, and the Experts tab shows no errors. Run the new version on a demo or cent account first if the update changed strategy behaviour — the release note will say when that matters.' },
      { type: 'h2', text: 'If something breaks: the clean reinstall' },
      { type: 'list', items: [
        'Close MetaTrader, delete the bot file from the Experts folder, and copy in a fresh download of the latest version — this rules out a corrupted file, the most common cause of a bot that will not attach.',
        'Reattach it to a fresh chart, load your saved settings, tick Allow Algo Trading, and check the Experts and Journal tabs for error messages.',
        'If the problem survives a clean reinstall, screenshot the Experts tab and message PrimeBot support on WhatsApp with your account number and the version you are running — that is exactly what the setup help in your license covers.',
      ] },
      { type: 'p', text: 'One honest note: an update improves the tool, not the market. A new version does not change your risk, remove drawdown, or guarantee any result — it simply keeps the software current, fixed and supported. Keep your version up to date, keep a saved copy of your settings, and message support the moment something looks wrong rather than trading through an error you do not understand. That habit, more than any single version, is what keeps a bot running cleanly for years.' },
    ],
  },
  {
    blog: 'trading',
    slug: 'position-sizing-explained-gold-trades',
    title: 'Position Sizing Explained: How Much to Risk on Each Gold Trade',
    excerpt:
      'Position size is the lever that turns a stop loss into a real money amount. How to size a gold trade so one loss stays small, no matter how wide the stop is.',
    category: 'Risk Management',
    date: '2026-10-29',
    readMins: 6,
    content: [
      { type: 'p', text: 'Two traders can take the same gold trade, with the same entry and the same stop loss, and walk away with completely different results. The difference is position size: how many lots they traded. The entry picks the direction, the stop loss picks the exit, but position size decides how much money is actually at stake. Traders who get this one idea right survive their losing streaks; traders who ignore it can be right about the market and still lose the account on a handful of trades.' },
      { type: 'h2', text: 'What position sizing really means' },
      { type: 'p', text: 'Position sizing is the calculation that links your stop distance to your money risk. If gold moves one dollar, a standard lot moves the position value by one hundred dollars, a mini lot by ten dollars, and a micro lot by one dollar. A stop that is five dollars away therefore risks five hundred dollars on a standard lot, fifty dollars on a mini lot, and five dollars on a micro lot. Same trade, same stop, ten times the difference in outcome. This is why experienced traders never start with the lot size. They start with the risk: how much of the account they are willing to lose if the stop is hit, usually one percent or less, and then work backwards to the lot size that produces exactly that risk.' },
      { type: 'h2', text: 'The three-step calculation' },
      { type: 'list', items: [
        'Step one, set the money risk: one percent of a 1,000 dollar account is 10 dollars, and one percent of a 10,000 dollar account is 100 dollars. Write this number down before looking at any chart.',
        'Step two, measure the stop distance in dollars: if you buy gold at 2,650 and place the stop at 2,645, the distance is five dollars, and that is the loss per lot unit you must plan for.',
        'Step three, divide the money risk by the stop distance and the value per lot: a 10 dollar risk divided by a five dollar stop gives a position worth two dollars per dollar of gold movement, which is two micro lots. The formula does the deciding, not your confidence in the trade.',
      ] },
      { type: 'p', text: 'Gold is a fast, volatile market. A five dollar move that would be a quiet day in some currency pairs is an ordinary hour in gold, and a news release can move it twenty dollars in minutes. A lot size that feels comfortable on a calm morning can become unmanageable by the afternoon, which is why gold traders size for the volatile day, not the calm one. If a position is so large that you cannot sleep while it is open, or that you keep checking the screen every few minutes, it is too large — regardless of what the calculation said. Reduce the size until the trade is boring to watch, because a boring trade is one you can manage by your plan instead of by your emotions.' },
      { type: 'h2', text: 'Mistakes that break good sizing' },
      { type: 'list', items: [
        'Doubling the size after a loss to win it back: this is how a small, survivable loss becomes the loss that ends the account.',
        'Using the same lot size on every trade: a wide stop and a tight stop are not the same risk, so a fixed lot size means your real risk swings wildly from trade to trade.',
        'Forgetting the account currency and contract size: on a cent account, one dollar of risk is counted as one hundred cents, so always check whether your platform shows cents or dollars before sizing.',
      ] },
      { type: 'p', text: 'Practice this on a demo or cent account for two weeks: before every trade, write down the money risk, the stop distance, and the lot size the calculation gives you. After twenty trades, look at the pattern. If your worst losing streak still leaves the account nearly whole, your sizing is working — and that is the real skill of trading. Nobody controls whether the next trade wins, but everybody controls how much it can cost. Position sizing is that control, and it is the difference between a trader who lasts and a trader who keeps starting over.' },
    ],
  },

  {
    blog: 'sales',
    slug: 'backtesting-primebot-mt5-before-going-live',
    title: 'Backtesting Your PrimeBot on MT5: How to Test Before You Go Live',
    excerpt:
      'Backtesting lets you watch a bot trade months of history in minutes. How to run a clean MT5 backtest, what the results actually tell you, and what they never promise.',
    category: 'Guides',
    date: '2026-10-29',
    readMins: 6,
    content: [
      { type: 'p', text: 'Before any bot touches a live account, it should be tested on history. Backtesting in MetaTrader 5 runs a bot over months or years of past price data and shows you how it would have traded: the entries, the exits, the winning and losing streaks, and the drawdown along the way. It takes minutes, costs nothing, and answers the first question every buyer should ask — does this bot behave the way its description says it does? This guide explains how to run a clean backtest and how to read the results honestly.' },
      { type: 'h2', text: 'Running a backtest, step by step' },
      { type: 'list', items: [
        'Open the Strategy Tester in MetaTrader 5 with Ctrl plus R, select your PrimeBot from the Expert Advisor list, and choose the symbol and timeframe the bot is designed for, usually XAUUSD on the timeframe stated in its guide.',
        'Set the test period to at least six months, and preferably a full year, so the test includes calm weeks, trending weeks and at least one sharp news move.',
        'Use the same starting balance as the account you plan to trade, and load the same settings you intend to use live — a backtest with different settings tests a different bot.',
        'Start the test, then study the graph and the results tab: total profit, maximum drawdown, win rate, and the longest losing streak, not just the final balance.',
      ] },
      { type: 'h2', text: 'What good results look like' },
      { type: 'p', text: 'A believable backtest is rarely a straight line upward. It has losing weeks, flat months and drawdowns, because real markets have them too. What matters is the shape: does the equity curve recover from its drawdowns, does the maximum drawdown stay within a level you could actually live through, and does the bot keep trading sensibly during volatile periods instead of opening a flood of trades? Compare the backtest drawdown with your own comfort level. A bot that lost thirty percent on history may do the same on your live account, and no backtest result justifies risking money you cannot afford to lose.' },
      { type: 'h2', text: 'What a backtest cannot tell you' },
      { type: 'list', items: [
        'Past results do not predict future results. A bot that performed well on last year data can perform differently this year, because market conditions change.',
        'Backtests use historical spreads and fills, which are usually cleaner than live trading during news releases, when spreads widen and slippage appears.',
        'A backtest that has been tuned until it looks perfect on one period is often overfitted: it learned the past instead of learning a robust rule, and it tends to disappoint on new data.',
      ] },
      { type: 'p', text: 'The sensible path is backtest, then demo, then a small live or cent account. If the backtest looks reasonable, run the same settings on demo for a few weeks and check that the live behaviour matches the backtest behaviour. If anything in the results confuses you, screenshot the Strategy Tester report and message PrimeBot support on WhatsApp — reading a backtest report together is exactly the kind of setup help your license includes. A backtest will not guarantee a profit, and any seller who claims otherwise should not be trusted. What it does give you is evidence, and trading on evidence instead of hope is the whole point.' },
    ],
  },
  {
    blog: 'trading',
    slug: 'keeping-trading-journal-losses-lessons',
    title: 'Keeping a Trading Journal: The Habit That Turns Losses Into Lessons',
    excerpt:
      'A trading journal costs nothing and takes five minutes a day, yet it is the one tool that separates traders who repeat mistakes from traders who stop making them. What to record, and how to review it.',
    category: 'Trading Psychology',
    date: '2026-10-30',
    readMins: 6,
    content: [
      { type: 'p', text: 'Ask any trader why they lost money last week and most will give you a feeling: the market was choppy, the news surprised them, gold moved too fast. Ask a trader who keeps a journal and you get an answer with evidence: three losses came from entering before the London session, two from moving a stop loss, one from trading on a phone while distracted. Feelings cannot be fixed. Patterns can. A journal turns a blurry week of trading into a record you can actually learn from, and it costs nothing but five honest minutes a day.' },
      { type: 'h2', text: 'What to write down after every trade' },
      { type: 'list', items: [
        'The setup: symbol, direction, entry, stop loss, take profit, and the exact reason you entered — one sentence, written before you click buy or sell, not after.',
        'The market context: trend direction on the higher timeframe, the trading session, and any major news due within the next hour.',
        'The outcome: result in money and in risk units, how long the trade lasted, and whether you followed your plan or improvised halfway through.',
        'Your state: tired, rushed, calm, revenge-driven. Emotion is data too, and it predicts mistakes better than any indicator.',
      ] },
      { type: 'h2', text: 'The weekly review that actually changes behaviour' },
      { type: 'p', text: 'A journal nobody reads is just a diary. Once a week, sit down for twenty minutes and sort your trades into two piles: trades that followed your plan and trades that did not. Most traders discover the same uncomfortable truth — the plan-following trades are roughly break-even or better, while the improvised trades carry almost all the damage. That single insight is worth more than any new indicator, because it tells you the strategy is not necessarily broken; the discipline around it is. Pick exactly one mistake to fix next week — one, not five — and write it at the top of the next page. Traders who fix one leak at a time improve steadily; traders who try to fix everything at once change nothing.' },
      { type: 'h2', text: 'What a journal will not do' },
      { type: 'list', items: [
        'It will not turn a losing strategy into a winning one. If every planned trade loses over months of honest records, the strategy itself needs rethinking, not the journal.',
        'It will not remove losses. Losing trades are part of trading; the journal only stops you from paying for the same lesson twice.',
        'It will not replace risk management. A beautiful journal entry about a trade that risked twenty percent of the account is still a dangerous trade.',
      ] },
      { type: 'p', text: 'Start tonight, not next month: a notebook, a spreadsheet, or a simple document all work, and the format matters far less than the honesty. Record the trade you are embarrassed about, not just the winners — the embarrassing ones are where the lessons live. Trading always carries risk and no journal guarantees profit, but traders who can show you their last fifty trades, with reasons, are traders who know what they are doing — and traders who know what they are doing are the only ones who last.' },
    ],
  },
  {
    blog: 'sales',
    slug: 'ea-not-trading-mt5-troubleshooting',
    title: 'EA Not Trading? Common MT5 Problems After Installing a Bot — and How to Fix Them',
    excerpt:
      'Your PrimeBot is attached but nothing happens? Before worrying, work through the usual MT5 culprits — auto-trading switches, permissions and the Experts log — most are fixed in under a minute.',
    category: 'Guides',
    date: '2026-10-30',
    readMins: 6,
    content: [
      { type: 'p', text: 'One of the most common support messages after installing an Expert Advisor reads: I attached the bot, but it is not opening trades. In most cases the bot is fine and MetaTrader 5 is simply waiting for something — a switch, a permission, or a market condition that has not arrived yet. Before contacting support, work through the checks below in order. They solve the large majority of no-trade reports, and each takes under a minute.' },
      { type: 'h2', text: 'The five-minute checklist' },
      { type: 'list', items: [
        'AutoTrading is ON: the AutoTrading button in the MT5 toolbar must be active, and the small icon next to the EA name on the chart should show a smiling face, not a frowning one. A frowning face means automated trading is disabled for that chart.',
        'Algo trading is allowed: in Tools, then Options, then Expert Advisors, check that algorithmic trading is enabled and that the EA has permission to trade. An EA without this permission can display on the chart but can never open a position.',
        'The right symbol and timeframe: a bot built for XAUUSD on a specific timeframe will not behave correctly on another symbol or timeframe, and some strategies only trade during certain sessions, so silence during quiet hours can be normal.',
        'The market is actually open: gold does not trade around the clock. Weekend hours, the daily rollover break, and public holidays mean no trades are possible even with everything switched on.',
        'Your account can trade: check that the account is connected, that the symbol is not in close-only mode, and that margin is sufficient for the smallest position the bot would open.',
      ] },
      { type: 'h2', text: 'Reading the Experts log' },
      { type: 'p', text: 'If all the switches are on and the bot still sits idle, the Experts tab at the bottom of MT5 will tell you why. Open it and look for the most recent lines from your PrimeBot: messages about disabled trading, invalid settings, or a license check will appear there in plain language. Take a screenshot of that tab before changing anything else — it is the single most useful thing you can send to support, because it turns a vague it is not working into a specific error that can be answered precisely. Do not randomly change inputs hoping to fix the problem; changing five settings at once makes the original cause impossible to find.' },
      { type: 'h2', text: 'When silence is normal' },
      { type: 'list', items: [
        'Session-based bots may wait hours for their trading window, and that patience is part of the strategy, not a fault.',
        'News filters deliberately pause trading around major releases, so a quiet period around CPI, NFP or a central bank announcement is the filter working as designed.',
        'A bot that has reached its daily loss limit or its maximum open trades will stop until conditions reset, which is exactly what those protections exist for.',
      ] },
      { type: 'p', text: 'If the checklist is clean, the log shows no errors, and the bot still has not traded after a full trading session, that is the right moment to contact PrimeBot support on WhatsApp with your MT5 version, the symbol and timeframe, and a screenshot of the Experts tab. That combination lets support diagnose the issue in one reply instead of five. Bots do not guarantee profits and no troubleshooting guide changes that — but a correctly installed bot that you understand is the foundation everything else is built on.' },
    ],
  },
  {
    blog: 'trading',
    slug: 'gold-trading-sessions-when-xauusd-moves',
    title: 'Gold Trading Sessions Explained: When XAUUSD Actually Moves',
    excerpt:
      'Gold does not move evenly through the day — it wakes up, surges, and goes quiet on a schedule. How the Sydney, Tokyo, London and New York sessions shape XAUUSD volatility, and why timing your chart time matters more than watching it all day.',
    category: 'Trading Basics',
    date: '2026-10-31',
    readMins: 6,
    content: [
      { type: 'p', text: 'A beginner who opens a gold chart at random times will conclude that XAUUSD is unpredictable: sometimes it crawls sideways for hours, sometimes it jumps twenty dollars in minutes. An experienced trader watching the same chart sees a schedule. Gold’s movement follows the world’s trading sessions, and understanding that rhythm — when liquidity arrives, when it leaves, and when news hits — explains most of what looks like randomness. You do not need to trade around the clock; you need to know which hours deserve your attention.' },
      { type: 'h2', text: 'The four sessions, in plain terms' },
      { type: 'list', items: [
        'Sydney and Tokyo (Asian session): generally the quietest hours for gold. Ranges are smaller, moves are slower, and breakouts here often reverse when London opens — a classic trap for traders who chase an early-morning move.',
        'London (European session): liquidity steps up sharply. Gold often sets its daily direction here, and the first London hours are where many genuine trends begin, because European banks, funds and traders are all active at once.',
        'New York (US session): the busiest window, especially the London-New York overlap in the early afternoon London time. Most major US economic releases land in this window, so gold can move fast on news — and just as fast back again.',
        'The overnight gap: between the New York close and the Asian open, liquidity thins again. Weekend gaps are the extreme version of this: gold reopens on Monday at a different price than Friday’s close, and stops placed over the weekend can fill far from where they were set.',
      ] },
      { type: 'h2', text: 'Why session timing beats screen time' },
      { type: 'p', text: 'Watching a chart for twelve hours does not make you twelve times better informed — it mostly makes you tired, and tired traders take trades they would have skipped fresh. A practical approach is to pick one or two sessions that fit your life, learn how gold normally behaves in those hours, and ignore the rest. A trader in Pakistan, for example, is awake for the London open and the New York overlap, the two most active windows, without needing to stay up all night. Whatever sessions you choose, keep a note of which hours your strategy actually performs in; many traders discover their results cluster in a single session, and that knowledge alone can cut their losing trades in half.' },
      { type: 'h2', text: 'Three session mistakes to avoid' },
      { type: 'list', items: [
        'Trading the Asian range as if it were a trend: a slow drift in thin liquidity is not momentum, and it frequently unwinds at the London open.',
        'Holding through a major US release without a plan: if you do not know the release time, you are not trading — you are gambling on a headline.',
        'Forcing a trade in a dead session because you feel you should trade today: the market does not owe you a setup, and a missed day costs nothing while a forced trade can cost plenty.',
      ] },
      { type: 'p', text: 'Sessions do not predict where gold will go — they tell you when it is most likely to move, and when a move is most likely to be real. Combine that awareness with a stop loss, a position size you can afford to lose, and the patience to wait for your own session, and you have something far more valuable than a new indicator: a trading day with a shape. Trading always carries risk and no session pattern guarantees profit, but traders who respect the clock stop fighting the market’s rhythm and start working with it.' },
    ],
  },
  {
    blog: 'sales',
    slug: 'primebot-license-explained-what-it-covers',
    title: 'PrimeBot License Explained: What Your License Covers, and What It Does Not',
    excerpt:
      'One license, one account, lifetime updates — but what does that actually mean in practice? A plain-language guide to PrimeBot licensing: accounts, devices, updates, support, and the limits every buyer should know before purchasing.',
    category: 'Guides',
    date: '2026-10-31',
    readMins: 6,
    content: [
      { type: 'p', text: 'Buying a trading bot should feel like buying a tool, not signing a mystery contract. Yet licensing pages are often written in legal shorthand that leaves the practical questions unanswered: how many accounts can I run it on, what happens when a new version comes out, and what exactly am I paying for? This guide answers those questions for PrimeBot in plain language, so you can buy with your eyes open — and so existing users can check what they already have.' },
      { type: 'h2', text: 'What a PrimeBot license includes' },
      { type: 'list', items: [
        'The Expert Advisor file itself, for MetaTrader 5, delivered after purchase with installation instructions for attaching it to a chart.',
        'Use on your licensed trading account, as specified at purchase — the license is tied to the account you register, not to a person or a computer, so changing devices does not require a new license.',
        'Free updates for the life of the product line: when a new version is released, existing license holders receive it without paying again, and the update guide walks through replacing the old file safely.',
        'Setup support through the usual channels: installation help, MT5 settings checks, and answers to the common first-week questions, such as why a bot has not traded yet.',
      ] },
      { type: 'h2', text: 'What a license does not include' },
      { type: 'list', items: [
        'It is not a managed account service: PrimeBot runs on your own MT5 account, under your own control. Nobody trades your account for you, and support will never ask for your account password.',
        'It is not a profit guarantee: no license, setting, or version can promise returns, and any seller who promises them is not being honest with you. Trading always carries risk, including the risk of losing your capital.',
        'It does not cover other products: each PrimeBot edition is licensed separately, so a license for one bot does not unlock the others.',
        'It does not include a VPS: if you want the bot running around the clock, hosting is arranged separately, and the VPS setup guide explains the options.',
      ] },
      { type: 'h2', text: 'Before you buy: three quick checks' },
      { type: 'p', text: 'First, confirm you trade on MetaTrader 5 with a broker that supports Expert Advisors and gold trading, since PrimeBot is built for that platform. Second, decide whether you want to start on a demo account — most buyers do, and the demo-to-live path is the safest way to learn the bot’s behaviour before risking real money. Third, keep your purchase email and license details somewhere safe; they are what support will ask for if you ever need to reinstall or move accounts. A license is a simple thing when it is explained simply: one account, lifetime updates, honest support, and no promises about profit. If a seller offers you more than that, ask what it costs them to promise it — and be cautious about the answer.' },
    ],
  },
  {
    blog: 'trading',
    slug: 'macd-explained-momentum-crossovers',
    title: 'MACD Explained: How Traders Read Momentum and Crossovers',
    excerpt:
      'The MACD is one of the most popular indicators on MT5, and one of the most misread. What its two lines and histogram actually measure, how traders use crossovers and divergences, and why it works best as a confirmation tool rather than a signal machine.',
    category: 'Indicators',
    date: '2026-11-01',
    readMins: 6,
    content: [
      { type: 'p', text: 'Open any MT5 chart and the MACD is usually a few clicks away, which is why beginners often treat it as a buy-and-sell machine: line crosses up, buy; line crosses down, sell. Used that way, it loses money in sideways markets and frustrates everyone who trusts it blindly. The MACD is not a fortune teller. It is a momentum thermometer — it measures whether recent price movement is speeding up or slowing down — and once you understand what it actually calculates, its signals become far easier to use sensibly.' },
      { type: 'h2', text: 'What the MACD is made of' },
      { type: 'list', items: [
        'The MACD line: the difference between a fast exponential moving average (usually 12 periods) and a slow one (usually 26 periods). When the fast average sits above the slow one, the line is positive; when it drops below, the line turns negative.',
        'The signal line: a 9-period moving average of the MACD line itself. It smooths the MACD line, so crossovers between the two lines are the signals most traders watch.',
        'The histogram: the visual gap between the MACD line and the signal line. Growing bars mean momentum is strengthening in the current direction; shrinking bars mean it is fading, even if price is still moving that way.',
        'The zero line: the level where the fast and slow averages are equal. MACD above zero means the shorter-term trend is stronger than the longer-term one, and below zero means the opposite.',
      ] },
      { type: 'h2', text: 'The three signals traders actually use' },
      { type: 'list', items: [
        'Crossovers: the MACD line crossing above its signal line suggests upward momentum is building; crossing below suggests downward momentum is building. These work best when they agree with the larger trend, not against it.',
        'Zero-line crosses: the MACD crossing from below zero to above it confirms a shift toward upward momentum, and the reverse confirms a shift downward. Many traders use these as trend filters rather than entry triggers.',
        'Divergence: price makes a new high but the MACD makes a lower high, or price makes a new low while the MACD makes a higher low. Divergence warns that momentum is weakening, but it is a warning, not an entry — prices can keep drifting long after momentum fades.',
      ] },
      { type: 'h2', text: 'Where the MACD misleads beginners' },
      { type: 'p', text: 'The MACD is a lagging indicator: it is built from past prices, so it confirms moves after they start rather than predicting them. In a choppy, sideways market it will cross back and forth repeatedly, generating losing signals one after another — the classic whipsaw. That is why experienced traders rarely trade MACD signals alone. A common approach is to use it as a filter: only consider long trades when the MACD is above zero on your trading timeframe, only consider short trades when it is below, and demand that price action itself — a level, a candle pattern, a session you understand — gives you the actual entry. Indicators should confirm your plan, not replace it.' },
      { type: 'p', text: 'Start on a demo chart: add the MACD with its default 12, 26, 9 settings, watch how the histogram shrinks before a trend stalls, and notice how many crossovers fail in a range. No indicator guarantees profit, and trading always carries risk, but a trader who knows what the MACD measures — momentum, not the future — will stop chasing every crossover and start using it for what it is good at: telling you whether the move you are watching still has strength behind it.' },
    ],
  },
  {
    blog: 'sales',
    slug: 'primebot-pre-launch-checklist-before-going-live',
    title: 'Before You Go Live with a PrimeBot: A Pre-Launch Checklist',
    excerpt:
      'Demo tested, settings reviewed, VPS running — or did you skip a step? A practical pre-launch checklist for PrimeBot buyers: the account, platform, settings and safety checks to complete before your first live trade.',
    category: 'Guides',
    date: '2026-11-01',
    readMins: 6,
    content: [
      { type: 'p', text: 'The most common first-week problems with any trading bot are not caused by the bot — they are caused by a skipped step: an EA attached to the wrong chart, auto-trading switched off, a VPS that was never started, or settings copied from someone else without understanding them. Going live is a milestone, and like any milestone it deserves a checklist. Work through the items below in order, and you will catch almost every avoidable mistake before it costs you money.' },
      { type: 'h2', text: 'The pre-launch checklist' },
      { type: 'list', items: [
        'Account check: confirm your MT5 account is the one registered to your PrimeBot license, and that your broker allows Expert Advisors and gold trading on that account type.',
        'Platform check: MetaTrader 5 is installed and updated, the PrimeBot file is attached to the correct chart and symbol, and the auto-trading button is switched on — the EA will not trade with it off, which is the single most common “it is not trading” cause.',
        'Settings check: read through every input once, in plain language, before going live. If you do not understand a setting, ask support or leave it at its default — never copy another trader’s settings blindly.',
        'Demo test first: run the bot on a demo account for enough days to see it trade in different conditions, including a news release. If anything behaves unexpectedly on demo, it will behave the same way live.',
        'Risk check: decide your risk level before the first trade, not during it. Know the maximum drawdown you are comfortable with, and make sure the account balance can support the bot’s position sizes.',
        'VPS check: if you plan to run the bot around the clock, confirm your VPS is online, MT5 is running on it, and the EA is attached there — not only on your home computer, which may sleep or lose connection.',
        'Support details saved: keep your purchase email and license details somewhere safe, so support can help you quickly if you ever need to reinstall or move accounts.',
      ] },
      { type: 'h2', text: 'Demo first is not wasted time' },
      { type: 'p', text: 'Some buyers rush past demo because it feels like waiting. It is actually the cheapest education available: demo shows you how the bot behaves on your broker’s prices, your spread, and your account type, with zero money at stake. Watch at least a few full trading days, check that trades open and close as expected, and practise the simple tasks — pausing the EA, checking its logs, restarting MT5 — while nothing is at risk. The confidence you build on demo is what keeps you calm when live trading gets bumpy, and calm traders make better decisions than panicked ones.' },
      { type: 'h2', text: 'Three mistakes the checklist prevents' },
      { type: 'list', items: [
        'Going live on an untested broker setup, then discovering spreads or execution differ from what the demo showed.',
        'Changing settings mid-trade because a single losing day felt uncomfortable — a plan changed in panic is rarely an improvement.',
        'Running the bot on two machines at once, which can double up trades. One live instance, on one platform, is the safe setup.',
      ] },
      { type: 'p', text: 'A bot is a tool, and tools reward preparation. Complete the checklist, start small, and keep support’s contact details close for the first week. PrimeBot cannot promise profits — no bot can, and trading always carries risk — but a careful launch means that whatever the market does next, you will know your setup is sound, and that is the foundation every good trading routine is built on.' },
    ],
  },
  {
    blog: 'trading',
    slug: 'fibonacci-retracement-explained-levels-entries',
    title: 'Fibonacci Retracement Explained: How Traders Use Levels to Plan Entries',
    excerpt:
      'The 38.2, 50 and 61.8 percent levels appear on almost every trading chart. What Fibonacci retracement actually measures, how traders draw it, and why it works best as a planning tool rather than a prediction.',
    category: 'Technical Analysis',
    date: '2026-11-02',
    readMins: 6,
    content: [
      { type: 'p', text: 'Open almost any trading chart and you will find a Fibonacci retracement tool in the drawing menu. After a strong move up or down, traders draw it across that move and watch a set of horizontal levels appear: 23.6, 38.2, 50, 61.8 and sometimes 78.6 percent. The percentages come from the Fibonacci number sequence, in which each number is the sum of the two before it, and the 61.8 percent level is the best known; the 50 percent level is included because half of a move is a natural reference point. These levels are a structured way of asking one practical question: if price pulls back from a big move, where might it pause, and where would my plan stop making sense? A retracement measures how much of a previous move price has given back, and each level marks the price where price has retraced that percentage of the move.' },
      { type: 'list', items: [
        '23.6 percent: a shallow pullback, common in very strong trends where price barely pauses before continuing.',
        '38.2 percent: the first level many traders treat as a meaningful pause, where early buyers may step back in.',
        '50 percent: the halfway point of the move, watched because so many traders and algorithms reference it.',
        '61.8 percent: the classic golden ratio level, often called the deep retracement zone where a trend either resumes or fails.',
        '78.6 percent: a deep pullback that leaves little room for error; if price goes much further, the original move is usually considered over.',
      ] },
      { type: 'h2', text: 'How traders draw it in practice' },
      { type: 'p', text: 'The drawing matters more than the tool itself. In an uptrend, anchor the tool at a clear swing low and stretch it to the swing high that followed it. In a downtrend, reverse the anchors: high first, then low. The key is to use obvious turning points that other traders can see too, not tiny wiggles inside a sideways range. Levels drawn on a clear, strong move are watched by more participants, and that shared attention is part of why price sometimes reacts at them. A level drawn on a messy, unclear move is mostly a guess, and it should be treated as one.' },
      { type: 'p', text: 'Fibonacci levels do not predict where price will go, and they do not work on their own. Price can sail straight through the 61.8 percent level without pausing, or bounce at a level that was never drawn at all. That is why experienced traders use retracement levels as zones to watch, not as automatic buy or sell signals. The usual approach is to wait for price to reach a level and then look for confirmation: a candle pattern, a support or resistance level from an earlier move, or a session with strong volume. The level narrows the search; the confirmation decides the trade. Risk management still comes first, with a stop loss placed where the trade idea is proven wrong, not where it merely feels uncomfortable.' },
      { type: 'h2', text: 'Three mistakes beginners make' },
      { type: 'list', items: [
        'Drawing on every move: retracement levels are most useful after a clear, strong trend leg, not inside choppy sideways price action.',
        'Treating a level as a guarantee: a bounce at 38.2 percent is a possibility to watch, not a promise, and it needs confirmation before any trade.',
        'Moving the anchors to fit a hoped-for outcome: if you redraw the tool until it supports the trade you already want, it has stopped being analysis.',
      ] },
      { type: 'p', text: 'Practise on a demo chart before using Fibonacci levels with real money. Draw them on past gold moves, note which levels price respected and which it ignored, and keep a simple record of what you observed. No tool removes risk from trading, and no level guarantees a profit, but a trader who uses retracement levels to plan entries, define invalidation, and wait for confirmation is thinking in structure rather than guessing at random prices — and that discipline is worth more than any single level.' },
    ],
  },
  {
    blog: 'sales',
    slug: 'adding-second-primebot-two-bots-one-account',
    title: 'Adding a Second PrimeBot: What to Check Before Running Two Bots on One Account',
    excerpt:
      'One PrimeBot running well often leads to the same question: can I add another? The license, setup and risk checks to work through first, so a second bot helps your trading instead of complicating it.',
    category: 'Guides',
    date: '2026-11-02',
    readMins: 6,
    content: [
      { type: 'p', text: 'When a first PrimeBot is running smoothly, many traders start thinking about a second one: a different strategy for a different market condition, a second account to separate testing from live trading, or simply more coverage across the week. Adding a second bot is straightforward, but it is not just a copy of the first setup. Two bots on one account or one platform interact with each other, with your margin, and with your attention. A short checklist before you add the second one prevents most of the problems that follow a rushed second installation.' },
      { type: 'h2', text: 'Start with why you want a second bot' },
      { type: 'list', items: [
        'A different market condition: one bot may suit trending markets while another is built for calmer, ranging conditions.',
        'Separation: keeping a tested live setup apart from a new bot you are still evaluating, so results stay easy to read.',
        'Coverage: spreading activity across sessions or symbols rather than relying on a single strategy all week.',
        'A reason to pause: if the honest answer is that the first bot had a losing week and a second bot feels like a quick fix, fix the plan first — adding risk rarely repairs a losing week.',
      ] },
      { type: 'h2', text: 'The checks to complete first' },
      { type: 'list', items: [
        'License check: confirm what your license covers before attaching a second bot, including whether it covers a second account. If anything is unclear, ask support before you install, not after.',
        'One instance, one chart: each bot belongs on its own chart and symbol, with its own settings. Never attach the same live instance twice, and never run the same live setup on two machines at once, or trades can double up.',
        'Margin and risk together: two bots share one account balance and one margin pool. Work out the combined position size and drawdown before going live, not after both bots are already trading.',
        'Settings reviewed separately: a second bot is not a clone of the first. Read its inputs on their own terms, and leave anything you do not understand at its default until you have asked support.',
        'Demo first, again: run the second bot on demo alongside your live setup for enough days to see how the two behave together, including around a news release.',
      ] },
      { type: 'h2', text: 'Reading results when two bots trade together' },
      { type: 'p', text: 'With two bots running, the account statement stops telling a simple story. A good week for one bot can hide a bad week for the other, and a single losing day can be hard to attribute. Keep the two bots easy to tell apart: note which bot opened each trade, check their results separately at the end of each week, and resist judging either one on a single day. If one bot consistently drags the combined result down, that is a decision to make calmly — pause it, review it on demo, or remove it — not a reason to add a third bot on top.' },
      { type: 'p', text: 'Add a second PrimeBot only when the first setup is stable, understood, and documented: you know its settings, you know its typical drawdown, and you know how to pause it. Then add the second one slowly, on demo first, with combined risk planned in advance. PrimeBot cannot promise profits — no bot can, and trading always carries risk — but two bots added carefully, each on its own chart with its own plan, give you a trading setup you can actually manage, and that is worth far more than a second bot added in a hurry.' },
    ],
  },
  {
    blog: 'trading',
    slug: 'leverage-explained-gold-trading',
    title: 'Leverage Explained: How It Amplifies Both Gains and Losses on Gold',
    excerpt:
      'Leverage lets a small deposit control a much larger gold position — which is exactly why it deserves a careful look before you use it. What leverage really means, how margin works, and why the same setting can speed up both wins and losses.',
    category: 'Trading Basics',
    date: '2026-11-03',
    readMins: 6,
    content: [
      { type: 'p', text: 'Every beginner meets leverage early, usually as a number like 1:100 or 1:500 on the account-opening page. It sounds like free buying power: deposit $100 and trade as if you had $10,000 or $50,000. That is technically what leverage does — but the number alone tells you nothing about risk. Understanding leverage means understanding margin, and margin is where most beginners get hurt.' },
      { type: 'h2', text: 'What leverage actually is' },
      { type: 'p', text: 'Leverage is borrowed capacity from your broker. With 1:100 leverage, a $100 deposit can open a position worth $10,000. With 1:500, the same deposit controls $50,000. You do not borrow money in the usual sense — the broker sets aside a small part of your deposit, called margin, as a security deposit for the position, and returns it when the trade closes. The rest of your balance is untouched by that trade, but it is still exposed: losses on the leveraged position come out of your real balance, dollar for dollar.' },
      { type: 'h2', text: 'A gold example, in plain numbers' },
      { type: 'list', items: [
        'One standard lot of gold (100 ounces) at $4,000 an ounce is a $400,000 position. With 1:100 leverage, the margin needed is $4,000.',
        'A 0.01 lot is one hundredth of that: a $4,000 position, needing $40 of margin at 1:100 — and $8 at 1:500.',
        'If gold moves $1 against a 0.01 lot, you lose about $1. If it moves $10, you lose about $10 — regardless of the leverage setting. Leverage changes how much margin is locked up, not how much a price move is worth.',
        'The danger is what leverage invites: with tiny margin requirements, it is easy to open ten or twenty times the position your balance can sensibly support, and then a normal $10 move becomes a $100 or $200 loss.',
      ] },
      { type: 'h2', text: 'Margin, margin call, and stop-out' },
      { type: 'p', text: 'Margin level is your equity divided by the margin in use, shown as a percentage. As losses grow, equity falls and the margin level drops. Near 100%, many brokers issue a margin call warning. At the stop-out level — often 20–50% depending on the broker — the broker starts closing your losing trades automatically, whether you agree or not. This is not a punishment; it is the broker protecting itself from your account going negative. The practical lesson is simple: keep your margin level comfortably high by keeping positions small relative to your balance, and never treat a margin call as a signal to deposit more and hold on.' },
      { type: 'h2', text: 'How experienced traders think about leverage' },
      { type: 'list', items: [
        'They size the trade first, then check the leverage: the question is "how much am I risking on this idea?", not "how big a position can I open?".',
        'They keep total risk small: most risk guides suggest no more than 1–2% of the balance on one idea, which keeps margin levels high even during losing streaks.',
        'They treat high leverage as a tool for margin efficiency, not for bigger bets — the same 0.01 lot behaves identically at 1:100 and 1:500, except that the higher setting locks up less margin.',
        'They avoid stacking positions: several open trades on the same symbol multiply the same risk, even if each one looked small on its own.',
      ] },
      { type: 'p', text: 'Leverage is neither good nor bad — it is a multiplier on whatever you already do. A careful trader with small positions uses it safely for years. A trader chasing a quick recovery uses it to turn a normal losing week into an empty account. Before you choose a leverage setting, decide your position size rules first, practise them on demo or a cent account, and let leverage serve the plan instead of replacing it. Trading always carries risk, and no leverage setting changes that.' },
    ],
  },
  {
    blog: 'sales',
    slug: 'run-primebot-from-phone',
    title: 'Can You Run a PrimeBot from Your Phone? What Mobile Traders Need to Know',
    excerpt:
      'Many traders check their accounts on a phone, so it is natural to ask whether a PrimeBot can run from one too. The honest answer: MT5 mobile apps cannot run Expert Advisors — here is how phone-based traders actually run a bot, and what still needs a computer or VPS.',
    category: 'Guides',
    date: '2026-11-03',
    readMins: 6,
    content: [
      { type: 'p', text: 'Almost every PrimeBot buyer asks some version of the same question: can I run it from my phone? Phones are where most people check prices, read news and manage their accounts, so it feels natural to expect the bot to live there too. The honest answer has two parts. No — an Expert Advisor cannot run inside the MT5 mobile app. But yes — a phone can still be the way you monitor and control a bot that runs elsewhere. Understanding the split saves buyers from a common disappointment: installing MT5 on a phone and wondering why the bot never trades.' },
      { type: 'h2', text: 'Why the mobile app cannot run a bot' },
      { type: 'list', items: [
        'Expert Advisors are programs that run inside the desktop version of MetaTrader 5. The mobile app is built for manual trading — placing orders, watching charts and checking positions — and it has no way to load or execute an EA.',
        'A bot also needs to be online around the clock to watch for its trading conditions. A phone sleeps, loses signal and runs out of battery, which would stop the bot mid-strategy.',
        'Attaching an EA to a chart, adjusting its inputs and testing it are all desktop-only actions in MT5, on Windows or Mac.',
      ] },
      { type: 'h2', text: 'How phone-based traders actually run a PrimeBot' },
      { type: 'p', text: 'The usual setup has two parts. The bot itself runs on a Windows computer or a VPS — a small rented virtual server that stays online 24 hours a day — with desktop MT5 open and the bot attached to its chart. The phone then becomes the monitoring screen: the MT5 mobile app, logged into the same account, shows every trade the bot opens and closes in real time, and lets you watch the balance, equity and open positions from anywhere. You can also close a trade manually from the phone if you ever need to, but the bot keeps working on the computer or VPS regardless of what the phone does.' },
      { type: 'h2', text: 'What you still need a computer for' },
      { type: 'list', items: [
        'Installing the bot and attaching it to a chart for the first time.',
        'Changing settings or updating to a new version.',
        'Backtesting a setup before going live.',
        'Fixing problems, such as a disconnected terminal or an expired VPS — although support can often guide you through these over chat while you sit at any computer.',
      ] },
      { type: 'h2', text: 'A practical setup for phone-first traders' },
      { type: 'p', text: 'If you do not have a computer running all day, a VPS is the standard answer, and it is the setup most PrimeBot buyers choose: the bot runs on the VPS, you monitor it from the MT5 mobile app, and you only need a computer for the occasional settings change or update. Before buying, check three things: that your license covers the account you plan to use, that your broker allows EAs on your account type, and that you are comfortable with the small monthly VPS cost as part of running a bot. With those in place, a phone is a perfectly good control room — it just cannot be the engine room, and any seller who promises a bot that runs inside a phone app is describing something that MT5 does not offer. PrimeBot cannot promise profits, and trading always carries risk, but a correctly placed bot — running on a computer or VPS and watched from your phone — is a setup you can rely on day after day.' },
    ],
  },
  {
    blog: 'trading',
    slug: 'bollinger-bands-explained-gold-volatility',
    title: 'Bollinger Bands Explained: How Traders Read Volatility Around Gold',
    excerpt:
      'Three lines that expand and contract with the market — what Bollinger Bands show about gold volatility, and what they cannot tell you on their own.',
    category: 'Indicators',
    date: '2026-11-04',
    readMins: 6,
    content: [
      { type: 'p', text: 'Open a gold chart, add Bollinger Bands, and you will see price travelling inside a moving channel that widens when the market gets wild and narrows when it calms down. That channel is the whole point of the indicator. Unlike a fixed support or resistance line, Bollinger Bands adapt to volatility, so they describe the current character of the market rather than predicting where price must go next. For a beginner, that makes them a useful second lens on a chart — as long as you understand what each line is actually measuring.' },
      { type: 'h2', text: 'What the three lines are' },
      { type: 'list', items: [
        'The middle line is a simple moving average, usually over 20 periods. It is the centre of the channel and a rough guide to the recent trend direction.',
        'The upper and lower bands sit a set distance above and below that average, normally two standard deviations. Standard deviation is just a measure of how spread out recent prices have been.',
        'When recent price swings are large, the bands widen. When price has been quiet, they narrow. The width of the channel is therefore a volatility reading, not a buy or sell signal by itself.',
      ] },
      { type: 'h2', text: 'How traders read the bands in practice' },
      { type: 'p', text: 'The most common beginner mistake is treating a touch of the upper band as an automatic sell and a touch of the lower band as an automatic buy. In a strong trend, price can ride along a band for a long time — traders call this walking the band — and every counter-trend trade taken on that touch loses. A more careful reading asks about context first: is price trending or ranging, where is it relative to the middle line, and is the band expanding or contracting? A touch that happens while the bands are widening in a strong trend means something very different from a touch inside a narrow, sideways channel.' },
      { type: 'h2', text: 'Beginner mistakes to avoid' },
      { type: 'list', items: [
        'Using the bands alone: pair them with trend, support and resistance, or another confirmation instead of trading every touch.',
        'Ignoring the timeframe: bands on a 5-minute chart describe minutes of volatility, not the daily trend, and the two often disagree.',
        'Forgetting news: a major economic release can blow price through a band in seconds, and no indicator setting prevents that.',
        'Chasing the width: widening bands confirm that a move is already happening; they do not guarantee it will continue.',
      ] },
      { type: 'p', text: 'Used well, Bollinger Bands answer one honest question: is gold moving violently right now, or is it quiet? That question matters for position sizing and for deciding whether conditions suit your strategy at all. Practise reading the bands on a demo account, compare them across timeframes, and judge them by how they help your decisions over many trades — not by any single touch. Like every indicator, they describe the market; they do not remove its risk, and no setting turns them into a promise of profit.' },
    ],
  },
  {
    blog: 'sales',
    slug: 'choosing-broker-for-primebot-checklist',
    title: 'Choosing a Broker for Your PrimeBot: What to Check Before You Attach a Bot',
    excerpt:
      'A trading bot is only as good as the account it runs on. The broker checklist to work through before you buy or attach a PrimeBot — spreads, execution, account type and demo testing.',
    category: 'Buying Guide',
    date: '2026-11-04',
    readMins: 6,
    content: [
      { type: 'p', text: 'Buyers usually spend weeks comparing bots and minutes choosing a broker, but the broker decision shapes everything the bot can do. Spreads, execution speed, account type and server stability all sit between a strategy and its results. A bot cannot fix a poor broker setup, and a good setup cannot make a bad strategy profitable — but checking a short list before you attach a PrimeBot removes the most common avoidable disappointments.' },
      { type: 'h2', text: 'The checklist, in order' },
      { type: 'list', items: [
        'MetaTrader 5 support: PrimeBot runs as an Expert Advisor on desktop MT5, so the broker must offer a real MT5 account, not only a mobile app or a web terminal.',
        'EAs allowed: confirm that your account type permits automated trading. Some account types restrict Expert Advisors, and discovering that after purchase wastes time.',
        'Gold trading conditions: check the spread and commission on XAUUSD, including how wide the spread gets around major news releases, since gold spreads can widen sharply at those moments.',
        'Execution and server stability: look for a broker with a record of stable servers and fast execution, and test it yourself on demo rather than trusting marketing claims.',
        'Swap and account currency: understand overnight swap charges on gold and whether your account currency matches how you plan to fund and withdraw.',
        'License match: a PrimeBot license is locked to an account number, so decide which account the bot will run on before ordering, and double-check the number you submit.',
      ] },
      { type: 'h2', text: 'Questions worth asking before you buy' },
      { type: 'p', text: 'Ask the broker directly whether EAs are allowed on your chosen account type, what the typical and maximum gold spread is, and whether there are any restrictions on automated trading during news. Ask PrimeBot support the same way: whether your planned setup — account type, VPS or home computer, and broker — is a combination other buyers already run successfully. Honest answers to boring questions prevent most setup problems. It also helps to know what a broker-side problem looks like, since some problems feel like bot problems when they are not: trades that open late during news, spreads so wide at the open that entries look wrong, or a terminal that disconnects while a VPS keeps running. Before blaming the bot, compare what happened with the broker trade history, the spread at that time, and the terminal journal — only the broker can fix its own spreads, execution or downtime, which is exactly why the choice matters before you go live.' },
      { type: 'h2', text: 'Test on demo, then go live slowly' },
      { type: 'p', text: 'The safest path is unglamorous: open a demo account with the broker you intend to use, attach the bot there, and watch it through different market conditions, including a news week. Check that trades open and close as expected, that the account type allows everything the bot needs, and that you are comfortable reading the trade history. Only then move to a live account, with position sizes you have already tested. PrimeBot cannot promise profits, and trading always carries risk — but a broker you have actually tested is one fewer unknown in a business that already has plenty.' },
    ],
  },
  {
    blog: 'trading',
    slug: 'atr-explained-average-true-range',
    title: 'ATR Explained: How Traders Use Average True Range to Size Stops and Read Volatility',
    excerpt:
      'One number that tells you how violently gold is moving right now — what Average True Range measures, how traders turn it into sensible stop distances, and what it can never tell you.',
    category: 'Indicators',
    date: '2026-11-05',
    readMins: 6,
    content: [
      { type: 'p', text: 'Every trader has felt the same frustration: a stop loss set a careful distance from entry, taken out by a normal swing, while the trade then goes on to move in the expected direction. Often the problem is not the idea but the distance. Average True Range, or ATR, exists to answer the question behind that frustration: how much does this market normally move? It does not predict direction and it never promises profit, but it gives stop placement a measurement instead of a guess.' },
      { type: 'h2', text: 'What ATR actually measures' },
      { type: 'list', items: [
        'True range is the largest of three measurements for a period: the high minus the low, the high minus the previous close, or the previous close minus the low. Including the previous close is what lets it capture overnight gaps.',
        'ATR smooths true range over a chosen number of periods, usually 14. The result is a single number in price units — for gold, in dollars per ounce.',
        'A high ATR means the market is swinging widely; a low ATR means it is quiet. If gold shows an ATR of $18 on the daily chart, daily swings of that size are currently normal, not exceptional.',
        'ATR is timeframe-dependent. The ATR on a 15-minute chart describes minutes of movement, while the daily ATR describes whole days. Never mix the two when sizing a stop.',
      ] },
      { type: 'h2', text: 'How traders turn ATR into a stop distance' },
      { type: 'p', text: 'The common method is to set the stop as a multiple of ATR — often 1.5 to 2 times the current value — rather than a fixed dollar amount. If daily ATR is $12, a 2x stop sits $24 from entry; if volatility doubles and ATR rises to $24, the same method gives a $48 stop. The logic is simple: in a wilder market, a trade needs more room to survive normal noise, and in a quiet market it needs less. That also changes position size, because a wider stop with the same risk budget means a smaller lot. ATR therefore connects two decisions beginners usually treat separately: where the stop goes, and how much to trade. Used this way, it protects the trader from the most avoidable loss — being stopped out by ordinary movement while the bigger idea was right.' },
      { type: 'h2', text: 'A practical ATR checklist' },
      { type: 'list', items: [
        'Check ATR on the timeframe you actually trade, not on a chart you happen to have open.',
        'Recheck it weekly: volatility regimes change, and a stop distance that was sensible last month may be far too tight or loose now.',
        'Around major news, expect ATR to understate the immediate risk — spreads widen and price can jump past a stop, so size for the worst case, not the average.',
        'Test any ATR multiple on demo first, across trending and ranging weeks, before trusting it with real money.',
      ] },
      { type: 'p', text: 'ATR will not make a losing strategy profitable, and no multiple of it removes the risk of trading. What it does is replace a hopeful guess with a measured one: this market currently moves this much, so this trade gets this much room. For beginners, that single habit — sizing stops to the market in front of you rather than to a round number — removes one of the most common reasons good ideas end in unnecessary losses.' },
    ],
  },
  {
    blog: 'sales',
    slug: 'primebot-weekend-market-close-gaps',
    title: 'What Happens to Your PrimeBot Over the Weekend: Market Close, Gaps and Monday Opens',
    excerpt:
      'The market closes on Friday and reopens on Monday — what your bot does in between, why Monday prices can jump, and the short checklist to run before the new week starts.',
    category: 'Guides',
    date: '2026-11-05',
    readMins: 5,
    content: [
      { type: 'p', text: 'New bot owners often worry about the weekend: is the bot still running, will it trade while the market is closed, and what happens to open trades? The short answer is reassuring. When the market closes on Friday, trading stops for everyone, bots included. Nothing opens or closes until prices flow again on Monday. But the weekend is not entirely uneventful, and knowing what to expect on Monday morning prevents the most common Monday panic.' },
      { type: 'h2', text: 'What happens while the market is closed' },
      { type: 'list', items: [
        'No new trades open and no open trades close, because there are no prices coming in. An Expert Advisor can only act on live ticks.',
        'Open positions simply carry over the weekend at their Friday closing prices, with their stop losses and take profits still attached.',
        'A VPS keeps your terminal and the bot running, but running does not mean trading — with no market feed, the bot waits, exactly as it should.',
        'Pending orders also wait. They are not cancelled by the weekend; they trigger only if price reaches them once trading resumes.',
      ] },
      { type: 'h2', text: 'Why Monday opens can gap' },
      { type: 'p', text: 'Over the weekend, news still happens: economic data, political events and central-bank comments can change how traders value gold before the market reopens. When trading resumes, the first price can therefore be some distance from Friday’s close — traders call this a gap. A gap can skip over a stop loss, so the exit may fill at the first available price rather than the exact stop level, and spreads are often wider than usual in the first minutes. This is normal market behaviour, not a bot malfunction, and it is one reason experienced traders avoid judging a bot by its first Monday minutes. If a bot uses a news filter, it may also pause around major scheduled releases early in the week, which is the same protection working as designed.' },
      { type: 'h2', text: 'The Monday-morning checklist' },
      { type: 'list', items: [
        'Confirm the terminal is connected: the connection status should show live prices flowing, not a “no connection” message.',
        'Confirm the bot is active on the chart, then leave it alone for the first minutes while spreads settle after the open.',
        'Check the account history and the terminal journal for anything unusual over the weekend, rather than reacting to a single gap move.',
        'Note any major news due that week on the economic calendar, so a pause in trading later in the week is expected, not alarming.',
      ] },
      { type: 'p', text: 'In practice, the weekend needs no action from you at all: no shutting the bot down, no closing trades early, and no Monday-morning adjustments. The one habit worth building is the checklist above — a calm two-minute check that the terminal, the bot and the account are all as they should be. PrimeBot cannot promise profits, and weekend gaps are part of the risk of holding trades over a close, but understanding the weekend removes the fear of it, and that is what lets a new owner leave the bot to do its job.' },
    ],
  },
  {
    blog: 'trading',
    slug: 'breakout-trading-gold-explained',
    title: 'Breakout Trading Explained: How Traders Spot and Trade Breakouts on Gold',
    excerpt:
      'Gold often moves in bursts after long quiet ranges. What a breakout actually is, how traders confirm one, and why so many breakouts fail — explained plainly, with the risk rules that matter.',
    category: 'Gold Trading',
    date: '2026-11-06',
    readMins: 6,
    content: [
      { type: 'p', text: 'Watch a gold chart for a few hours and you will see the same pattern again and again: price drifts sideways in a narrow range, then suddenly breaks out and runs $10, $20 or more in one direction. Traders call that sudden move a breakout — the moment price escapes a level that had been holding it back. Breakouts are popular because they are easy to see, but they are also one of the most misunderstood ideas in trading. Not every break above a level is a real breakout, and the difference between a real one and a fake one is usually what decides whether the trade makes or loses money.' },
      { type: 'p', text: 'A breakout happens when price moves through a level that has stopped it at least twice before. The level can be a previous day high or low, the top or bottom of a sideways range, a round number such as $4,000, or the high of the London or New York session. The more times price tested the level and turned back, the more attention traders pay when it finally breaks through — because every trader watching that level now has to make a decision at the same time.' },
      { type: 'list', items: [
        'Range breakouts: price escapes a sideways box it has been stuck in for hours.',
        'Session breakouts: price breaks the high or low of the London or New York session.',
        'Round-number breakouts: price pushes through a big psychological level like $4,000.',
        'News breakouts: a major release such as CPI or NFP sends price through a level in seconds.',
      ] },
      { type: 'h2', text: 'Why so many breakouts fail' },
      { type: 'p', text: 'Gold is famous for false breakouts — price pokes above a level, triggers the buy orders waiting there, then falls straight back inside the range. This often happens around news releases, when spreads widen and price whipsaws in both directions, or during quiet hours when a small order can push price through a thin level. A common way traders try to filter these out is to wait for confirmation: a candle that closes beyond the level rather than just touching it, or price coming back to retest the broken level and holding above it before continuing. Neither method guarantees anything — a confirmed breakout can still reverse — but waiting for a close filters out many of the quickest fake-outs.' },
      { type: 'h2', text: 'A simple breakout routine for beginners' },
      { type: 'list', items: [
        'Mark the level first: draw the range or the previous high and low before the session starts, not while price is already moving.',
        'Decide the confirmation rule in advance — for example, a 15-minute candle closing beyond the level — and do not change it mid-trade.',
        'Place the stop loss back inside the range, where the idea is proven wrong, not at an arbitrary distance.',
        'Risk the same small amount on every breakout idea, no more than 1% of the account, because several breakouts in a row can fail.',
        'Check the economic calendar: a breakout minutes before a major release is often just noise ahead of the real move.',
      ] },
      { type: 'p', text: 'Breakouts work best as one idea inside a plan, not as a strategy on their own. Mark the level, wait for your confirmation, size the trade so a failure costs almost nothing, and accept that many breakouts will fail — the edge, if there is one, comes from keeping the losses small and letting the real moves run. No pattern, including a breakout, can promise a profit, and gold can reverse without warning. Learn the pattern on demo or a small cent account first, and judge it over dozens of trades, never over a single lucky move.' },
    ],
  },
  {
    blog: 'sales',
    slug: 'primebot-cent-vs-standard-account',
    title: 'PrimeBot on a Cent Account vs a Standard Account: Which Setup Fits Your Budget',
    excerpt:
      'The same PrimeBot, the same settings logic — but very different money at risk. How cent and standard accounts differ, which one fits your budget, and what stays exactly the same either way.',
    category: 'Guides',
    date: '2026-11-06',
    readMins: 6,
    content: [
      { type: 'p', text: 'One of the first questions new PrimeBot buyers ask is whether to run the bot on a cent account or a standard account. The honest answer is that both work — the bot itself does not care which account type it is attached to. What changes is the amount of money at risk on every trade, and that makes the choice mostly a question of budget and comfort, not of performance. Understanding the difference before you fund an account saves the most common beginner mistake: starting on a standard account with more money at risk than intended.' },
      { type: 'h2', text: 'How cent and standard accounts differ' },
      { type: 'list', items: [
        'Money at risk: on a standard account, a 0.01 lot of gold moves roughly $1 per $1 of price movement. On a cent account, the same 0.01 lot moves about one cent per $1 — one hundredth of the risk.',
        'Balance display: a $100 deposit shows as 10,000 cents on a cent account. The numbers look bigger, but the real money is the same $100.',
        'Price feed: both account types usually run on the same broker prices and spreads, so the bot sees the same market either way.',
        'Lot sizes: the bot uses the same lot logic on both. The difference is only what each lot is worth in real money.',
      ] },
      { type: 'h2', text: 'Which one fits your budget' },
      { type: 'p', text: 'A cent account fits a small starting budget. With $50–$200 you can run the bot with realistic lot sizes and let it trade through normal ups and downs without a single losing run threatening the whole deposit. That breathing room is exactly why many buyers start there: they learn how the bot behaves, how drawdown feels, and how settings work, while the real money at stake stays small. A standard account fits a larger budget, where the same lot sizes represent a meaningful but still affordable risk — typically a deposit where risking 1% per idea leaves plenty of room for the strategy to work. The wrong setup in either direction is the same mistake: a standard account funded so thinly that one normal losing run ends the account, or a cent account treated as play money and ignored completely.' },
      { type: 'h2', text: 'What stays exactly the same' },
      { type: 'list', items: [
        'The same EA file: you install the identical PrimeBot on MT5, whichever account type you choose.',
        'The same license: your account-number license covers the trading account you registered, cent or standard.',
        'The same settings logic: risk settings, news filter and session behaviour work identically on both.',
        'The same VPS need: if you run the bot around the clock, a VPS keeps MT5 online on either account type.',
      ] },
      { type: 'p', text: 'Starting on a cent account does not lock you in. Many traders begin there, get comfortable with the bot over a few weeks, and later move to a standard account with a bigger deposit once they understand the drawdown and the pace of trading. If you switch accounts, remember that the license is tied to an account number, so check the license guide before moving — a new account number may need the license updated. And whichever account you choose, keep expectations honest: no account type changes the fact that trading carries risk, and no bot can promise profits. The right setup is simply the one where you can leave the bot running, sleep well, and judge it over weeks rather than over a single day.' },
    ],
  },
  {
    blog: 'trading',
    slug: 'gold-us-dollar-correlation-explained',
    title: 'Gold and the US Dollar: Why They Usually Move in Opposite Directions',
    excerpt:
      'When the dollar rises, gold often falls — and the other way around. The reason is simpler than most traders think, and the exceptions are just as important as the rule.',
    category: 'Gold Trading',
    date: '2026-11-07',
    readMins: 6,
    content: [
      { type: 'p', text: 'Watch gold and the US dollar index side by side for a week and a pattern jumps out: when the dollar strengthens, gold usually weakens, and when the dollar slides, gold often climbs. It is one of the most repeated relationships in trading — and one of the most misunderstood. The link is real, but it is a tendency, not a law, and knowing why it exists is the difference between using it and being fooled by it. The first reason is simple: gold is traded worldwide in US dollars, so the dollar is the measuring stick for gold itself. When the dollar rises, gold becomes more expensive for buyers holding euros, rupees or yen, and demand softens; when the dollar falls, the same gold becomes cheaper for those buyers, and demand rises.' },
      { type: 'h2', text: 'Three forces that push them apart' },
      { type: 'list', items: [
        'Interest rates: when US rates rise, the dollar usually strengthens because investors chase higher yields — and gold, which pays no interest, becomes less attractive by comparison.',
        'Safe-haven flows: in a crisis, money often runs to both the dollar and gold at once, which is when the usual inverse link breaks down.',
        'Inflation expectations: when traders expect inflation to rise, gold often climbs as a store of value, while the dollar can weaken if markets expect the Federal Reserve to keep rates low.',
      ] },
      { type: 'h2', text: 'When the rule breaks — and why beginners get hurt' },
      { type: 'p', text: 'The correlation is strongest in calm markets and weakest exactly when it matters most. During wars, banking stress or a stock-market crash, both gold and the dollar can rise together as traders buy safety in every form. A trader who shorts gold simply because the dollar is rising, without checking the news, can be caught by exactly that move. The same applies in reverse: a falling dollar does not guarantee rising gold if real interest rates are climbing at the same time.' },
      { type: 'h2', text: 'How traders use the relationship sensibly' },
      { type: 'list', items: [
        'Use the dollar index (DXY) as context, not as a signal — a weak dollar supports a gold-buying idea, it does not create one.',
        'Check the reason behind the dollar move: a rate-driven dollar rally hits gold harder than a risk-driven one.',
        'Watch real interest rates, not just the dollar: gold cares most about what you earn after inflation, and the dollar is only part of that picture.',
        'Never size a trade on correlation alone — a stop loss and a position-size rule still decide whether you survive being wrong.',
      ] },
      { type: 'p', text: 'The gold-dollar link is one of the most useful pieces of context a trader can carry — and one of the most dangerous to trade blindly. Treat it as background music for your analysis, not as the trade itself, and always let your risk rules have the final word.' },
    ],
  },
  {
    blog: 'sales',
    slug: 'primebot-vs-manual-trading',
    title: 'PrimeBot vs Manual Trading: What Automation Changes — and What It Does Not',
    excerpt:
      'A bot never sleeps, never panics and never hesitates. But it also never thinks. An honest comparison of automated and manual trading, so you can choose the right approach for you.',
    category: 'Product Guide',
    date: '2026-11-07',
    readMins: 6,
    content: [
      { type: 'p', text: 'Every trader eventually asks the same question: should I trade by hand, or let a bot do it? The honest answer is that automation changes some things completely and leaves others exactly as they were. Understanding which is which is the first step to choosing well — and to avoiding disappointment either way.' },
      { type: 'h2', text: 'What automation actually changes' },
      { type: 'list', items: [
        'Consistency: a bot applies the same rules to every trade, at 3 a.m. as reliably as at 3 p.m. It never gets tired, bored or distracted.',
        'Emotion: a bot cannot revenge-trade after a loss, double its size out of frustration, or move a stop loss because closing at a loss hurts.',
        'Coverage: it watches the market around the clock and never misses its setup — including the London–New York overlap hours when you are asleep or at work.',
        'Speed: entries, basket management and exits happen the moment the rules are met, with no hesitation and no second-guessing.',
      ] },
      { type: 'h2', text: 'What automation does not change' },
      { type: 'p', text: 'A bot does not remove risk, and it does not turn a losing strategy into a winning one. The strategy inside the bot is still a human idea, tested on past data, and markets change. Drawdowns still happen — a bot in a losing run can lose money faster than a manual trader simply because it keeps trading while a human would have stopped. And a bot cannot judge context the way a person can: an unusual news event, a holiday-thin market, or a broker outage still needs a human to notice and act.' },
      { type: 'h2', text: 'Who should choose which' },
      { type: 'list', items: [
        'Choose automation if your struggle is discipline — you have a plan but keep breaking it, or you cannot watch the market during the hours your strategy needs.',
        'Choose manual trading if you enjoy reading the market, trade a small number of well-chosen setups, and want full control over every decision.',
        'Many experienced traders use both: a bot running a tested system on one account, and manual trades on another, so neither approach carries the whole account.',
      ] },
      { type: 'p', text: 'If you go the automation route, start the right way: read the strategy logic in plain words before you buy, test the bot on a demo or cent account for several weeks, and learn its settings — especially the drawdown stop and the news filter — before it ever touches real money. That preparation is what separates automation that helps from automation that hurts. If you would like help deciding which PrimeBot tier fits your account size and experience, our WhatsApp support will point you to the right one — even if it is the cheapest.' },
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
