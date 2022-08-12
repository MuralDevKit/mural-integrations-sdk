Feature: Account chooser

  Scenario: when requiring consent and no account for hint, both 'sign in with' and 'sign up from hint' are shown
    Given user principal name is any_email@gmail.com
    And the POST REALM api response is 200 status with
    """
    {
      "accountStatus": 0,
      "canAccessTenant": false,
      "authUrl": "https://accounts.google.com/o/oauth2/v2/auth",
      "identityProviderName": "google",
      "overridable": true,
      "requireConsent": true
    }
    """
    When I visit the "account chooser" route
    Then [sign up with] is shown
    And [sign up from hint] is shown

  Scenario: when not requiring consent and no account for hint, only 'sign up from hint' is shown
    Given user principal name is any_email@mural.co
    And the POST REALM api response is 200 status with
    """
    {
      "accountStatus": 0,
      "canAccessTenant": false,
      "authUrl": "https://accounts.google.com/o/oauth2/v2/auth",
      "identityProviderName": "internal-sso"
    }
    """
    When I visit the "account chooser" route
    Then [sign up with] is not shown
    And [sign up from hint] is shown

  Scenario: when account exist for hint, 'sign in from hint' is shown
    Given user principal name is existing@mural.co
    And the POST REALM api response is 200 status with
    """
    {
      "accountStatus": 2,
      "canAccessTenant": false,
      "authUrl": "https://accounts.google.com/o/oauth2/v2/auth",
      "identityProviderName": "internal-sso"
    }
    """
    When I visit the "account chooser" route
    Then [sign in from hint] is shown
