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
];

export function postsFor(blog: BlogKind): BlogPost[] {
  return BLOG_POSTS.filter((p) => p.blog === blog).sort((a, b) =>
    b.date.localeCompare(a.date),
  );
}

export function findPost(blog: BlogKind, slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.blog === blog && p.slug === slug);
}
