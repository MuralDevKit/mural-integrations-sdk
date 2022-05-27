Feature: OAuth session activation route

  Background:
    Given search params are { "code": "dummy_code", "redirectUrl": "http://app.mural.co" }

  Scenario: you are redirected to murally claim url
    When I visit the "oauth session activation" route
    And the route has finished loading
    Then the browser redirects to "https://murally.testing.rig/claim_url?redirectUrl=http://app.mural.co/"
