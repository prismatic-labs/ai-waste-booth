/*
  Track B config — fill in these URLs then copy into receipt-engine/config.js
  ─────────────────────────────────────────────────────────────────────────────

  UPGRADE_URL
    Stripe Payment Link for the £15 Ox Tech Week Workflow Upgrade.
    Setup: https://dashboard.stripe.com/payment-links → Create link
    Product name: "Ox Tech Week Workflow Upgrade" | Price: £15.00 one-time
    After payment: redirect to INTAKE_FORM_URL
    ✓ Enable "Collect customer's email" in link settings

  TEARDOWN_URL
    Calendly link for the 20-min Silent Failure Teardown.
    Setup: https://calendly.com → New event type → "Silent Failure Teardown" 20 min
    Description: "A focused look at suspected failure patterns in your LLM system."
    ✓ Set location to Westgate Library, Oxford / virtual

  INTAKE_FORM_URL
    Tally.so (or Google Form) for post-£15-purchase intake.
    Fields: email · archetype received · original use case ·
            describe your messy prompt/workflow · desired outcome
    Completion message: "You'll receive your upgraded workflow within 5 working days."
    Setup: https://tally.so → New form

  CENSUS_SIGNUP_URL
    Simple email-capture form (Tally or Google Form).
    Used as the fallback QR target when the main app is unreachable.
    Fields: name · email · casual/builder
    OR just point at capture-routing/fallback.html once deployed.
*/

const CONFIG = {
  UPGRADE_URL:       "",  // paste Stripe Payment Link URL here
  TEARDOWN_URL:      "",  // paste Calendly URL here
  INTAKE_FORM_URL:   "",  // paste Tally intake form URL here
  CENSUS_SIGNUP_URL: "",  // paste email capture form URL here
  CENSUS_ENDPOINT:   "",  // leave empty until Track C census endpoint is live
};
