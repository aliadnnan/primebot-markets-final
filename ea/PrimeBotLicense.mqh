//+------------------------------------------------------------------+
//|                                              PrimeBotLicense.mqh |
//|            Online license check for PrimeBot Markets EAs          |
//|                                                                   |
//|  The EA asks the PrimeBot website whether this MT5 account +      |
//|  license key is active. The admin can disable a license or let    |
//|  it expire from the website's Admin -> Licenses tab, and every    |
//|  running EA picks the change up on its next check (15 minutes).   |
//|  This sits ON TOP of the compiled-in account-number lock.         |
//|                                                                   |
//|  SETUP (one time, in the terminal running the EA):                |
//|    MT5 -> Tools -> Options -> Expert Advisors ->                  |
//|    check "Allow WebRequest for listed URL" and add:               |
//|      https://primebot-markets-final.vercel.app                    |
//|                                                                   |
//|  USE IN AN EA:                                                    |
//|    #include <PrimeBotLicense.mqh>                                 |
//|    OnInit():   LicenseInit();                                     |
//|    OnTick():   LicenseTick();        // re-checks every 15 min    |
//|    Trade gate: if(!LicenseOK()) return;  // no new trades         |
//+------------------------------------------------------------------+
#property strict

input string InpLicenseKey      = "";   // License key (from PrimeBot admin Licenses tab)
input string InpLicenseCheckUrl = "https://primebot-markets-final.vercel.app/api/license/check"; // License check URL

//--- License state. Read it ONLY through LicenseOK().
bool     g_license_ok         = false;  // stays false until the first successful "active" answer
string   g_license_reason     = "";     // last reason: "" | disabled | expired | not_found
datetime g_license_last_check = 0;      // TimeCurrent() of the last completed check
#define  LICENSE_RECHECK_SECONDS 900    // 15 minutes

//+------------------------------------------------------------------+
//| Ask the server once, right now. Returns true when the server      |
//| answered (whatever the answer was); false on a network error.    |
//|                                                                   |
//| Behaviour on purpose:                                         |
//|  - Server says active            -> g_license_ok = true           |
//|  - Server says disabled / expired / not_found                     |
//|                                  -> g_license_ok = false          |
//|  - Network error / server error  -> state UNCHANGED, warning      |
//|    printed. A buyer's EA never stops just because the internet    |
//|    blinked; it stops when the admin (or the expiry date) says so. |
//+------------------------------------------------------------------+
bool LicenseCheckNow()
{
   g_license_last_check = TimeCurrent();

   if(StringLen(InpLicenseKey) == 0)
   {
      g_license_ok = false;
      g_license_reason = "not_found";
      Print("[PrimeBot License] No license key set. Fill the InpLicenseKey input with the key from the PrimeBot admin, then re-attach the EA.");
      return false;
   }

   long account = AccountInfoInteger(ACCOUNT_LOGIN);
   string url = InpLicenseCheckUrl
              + "?account=" + IntegerToString(account)
              + "&key=" + InpLicenseKey;

   char post[];            // GET: no body
   char result[];
   string result_headers = NULL;
   ResetLastError();
   int status = WebRequest("GET", url, NULL, 5000, post, result, result_headers);

   if(status == -1)
   {
      int err = GetLastError();
      if(err == 4060)
         Print("[PrimeBot License] WebRequest is BLOCKED for this URL (error 4060). Add https://primebot-markets-final.vercel.app in MT5 -> Tools -> Options -> Expert Advisors -> 'Allow WebRequest for listed URL', then re-attach the EA.");
      else
         PrintFormat("[PrimeBot License] WebRequest failed, error %d. Keeping the previous license state; will retry in 15 minutes.", err);
      return false;
   }

   string body = CharArrayToString(result, 0, WHOLE_ARRAY, CP_UTF8);

   //--- Extract the reason ("" when the license is active).
   string reason = "";
   int rp = StringFind(body, "\"reason\":\"");
   if(rp >= 0)
   {
      int start = rp + 10;
      int end = StringFind(body, "\"", start);
      if(end > start)
         reason = StringSubstr(body, start, end - start);
   }

   bool active = (StringFind(body, "\"ok\":true") >= 0 && StringFind(body, "\"active\":true") >= 0);

   if(status == 200 && active)
   {
      if(!g_license_ok)
         PrintFormat("[PrimeBot License] OK - account %I64d license is ACTIVE.", account);
      g_license_ok = true;
      g_license_reason = "";
      return true;
   }

   if(reason == "disabled" || reason == "expired" || reason == "not_found")
   {
      g_license_ok = false;
      g_license_reason = reason;
      if(reason == "disabled")
         PrintFormat("[PrimeBot License] STOPPED - the license for account %I64d has been DISABLED by the admin. No new trades will open.", account);
      else if(reason == "expired")
         PrintFormat("[PrimeBot License] STOPPED - the license for account %I64d has EXPIRED. Renew it in the PrimeBot admin to resume trading.", account);
      else
         PrintFormat("[PrimeBot License] STOPPED - no license found for account %I64d with this key. Check the account number and InpLicenseKey.", account);
      return true;
   }

   //--- Anything else (5xx, unexpected body): transient - keep state.
   PrintFormat("[PrimeBot License] Unexpected answer (HTTP %d): %s. Keeping the previous license state; will retry in 15 minutes.", status, body);
   return false;
}

//+------------------------------------------------------------------+
//| Call once from the EA's OnInit().                                 |
//+------------------------------------------------------------------+
void LicenseInit()
{
   LicenseCheckNow();
}

//+------------------------------------------------------------------+
//| Call from the EA's OnTick() (cheap: it only hits the network      |
//| once every 15 minutes). If the EA uses OnTimer instead, call     |
//| LicenseTick() from OnTimer() - same behaviour.                    |
//+------------------------------------------------------------------+
void LicenseTick()
{
   if(g_license_last_check == 0 || (TimeCurrent() - g_license_last_check) >= LICENSE_RECHECK_SECONDS)
      LicenseCheckNow();
}

//+------------------------------------------------------------------+
//| The trade gate: check this before opening ANY new trade.          |
//|   if(!LicenseOK()) return;                                        |
//| Existing open positions / baskets are NOT touched by this file -  |
//| managing or closing them stays the EA's own decision.             |
//+------------------------------------------------------------------+
bool LicenseOK()
{
   return g_license_ok;
}

//+------------------------------------------------------------------+
//| Last blocking reason ("" when active) - for dashboards/panels.    |
//+------------------------------------------------------------------+
string LicenseReason()
{
   return g_license_reason;
}
//+------------------------------------------------------------------+
