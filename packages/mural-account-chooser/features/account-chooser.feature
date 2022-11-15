Feature: Account chooser

  Scenario: when no hint email, 'sign up' is shown
    When I visit the "account chooser" route
    Then [sign up] is shown
    And [continue with email] is not shown

  Scenario: when hint email, 'continue with email' is shown
    Given user principal name is any_email@gmail.com
    And the POST REALM api response is 200 status with
    """
    {
      "accountStatus": 2,
      "requireConsent": false,
      "authUrl": "https://accounts.google.com/o/oauth2/v2/auth",
      "identityProviderName": "google"
    }
    """
    When I visit the "account chooser" route
    Then [continue with email] is shown
    And [sign up] is not shown

  Scenario: when not requiring consent and no account for hint, 'continue with email' is shown
    Given user principal name is any_email@mural.co
    And the POST REALM api response is 200 status with
    """
    {
      "accountStatus": 0,
      "authUrl": "https://accounts.google.com/o/oauth2/v2/auth",
      "identityProviderName": "internal-sso"
    }
    """
    When I visit the "account chooser" route
    Then [continue with email] is shown

  Scenario: when requiring consent and no account for hint, 'sign-up-with' is shown
    Given user principal name is any_email@gmail.com
    And the POST REALM api response is 200 status with
    """
    {
      "accountStatus": -1,
      "requireConsent": true,
      "authUrl": "https://accounts.google.com/o/oauth2/v2/auth",
      "identityProviderName": "google"
    }
    """
    When I visit the "account chooser" route
    And I click on [continue with email]
    Then [sign up with] is shown
    And [send verification email] is shown
