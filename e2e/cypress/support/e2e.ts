import './commands';

// Cypress already fails a test on any uncaught front-end exception or
// unhandled promise rejection by default - intentionally not overriding that
// here, since it directly matches the correction sheet's "Crash" criterion
// ("If at any point during the defense an unexpected or unhandled front-end
// error appears in the web console..."). Specs that need to assert a
// *specific* handled error (e.g. an expected 400/404/417 from the backend)
// should scope any `cy.on('uncaught:exception', ...)` opt-out locally to that
// test only, never globally here.
