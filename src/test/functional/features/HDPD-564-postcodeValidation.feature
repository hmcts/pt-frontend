@JIRA-EPIC:HDPD-564 @regression @WIP
Feature: Postcode Validation and Rollout Journey
As a citizen
I want to enter a postcode for my property
So that the system validates it and directs me to the correct journey

  Background:
    Given I landed on postal code page successfully

@AC1 @AC2 @AC4 @JIRA-TEST-KEY:PTSD-767 @JIRA-TEST-KEY:PTSD-770 @JIRA-TEST-KEY:PTSD-768 
  Scenario Outline: Validate postcode journey
   When I enter postcode "<postcode>"
    And I click 'Continue'
    Then I should see "<outcome>"

    Examples:
      | postcode | outcome                                          |
      | SW1A 1AA | You need to use another form to apply            |
      | CF10 1EP | Sorry, this service is only available in England |
      |          | Enter a postcode                                 |
      | M14 5AB  | Is your landlord a housing association?          |
      | B15 2TT  | Is your landlord a housing association?          |

  @AC5 @JIRA-TEST-KEY:PTSD-771
  Scenario: Invalid postcode format
    When I enter postcode "ABC123"
    And I click 'Continue'
    Then I should see postcode validation error
