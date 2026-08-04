@HDPD-564 @postalCodeValidation
Feature: Postcode Validation and Rollout Journey
As a citizen
I want to enter a postcode for my property
So that the system validates it and directs me to the correct journey

  Background:
    Given I am on the postcode page

  Scenario Outline: Validate postcode journey
    When I enter postcode "<postcode>"
    And I click Continue
    Then I should see "<outcome>"

    Examples:
      | postcode | outcome                                          |
      | SW1A 1AA | You need to use another form to apply            |
      | CF10 1EP | Sorry, this service is only available in England |
      |          | Enter a postcode                                 |

  Scenario: Invalid postcode format
    When I enter postcode "ABC123"
    And I click Continue
    Then I should see postcode validation error
