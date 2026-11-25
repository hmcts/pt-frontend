@JIRA-TEST-KEY:HDPD-590 @regression
Feature: Tribunal previously determined the rent
  As a citizen completing rent details
  I want to say whether a tribunal has previously determined my rent
  So that the application records any previous determination

  Background:
    Given the user navigates to PT url
    And the user has successfully logged on to market-rent-determination application
    Then check that the user is redirected to the my-application page
    When user clicks on the my application link
    Then check that the user is redirected to the application-type page
    And I select the option "Challenge my rent as excessive within the first 6 months of the tenancy"
    And I click "Continue"
    Then check that the user is redirected to the "tenancy-type" page
    And I select the option "Assured periodic tenancy"
    And I click "Continue"
    And I click "Current rent, other costs and your proposed market rent"
    Then the page should include "Has the tribunal previously determined the rent for your tenancy?"

  @AC01 @CT
  Scenario: Yes reveals the tribunal case reference field
    Then the tribunal case reference field should not be displayed
    When I select "Yes" for the question "Has the tribunal previously determined the rent for your tenancy?"
    Then the tribunal case reference field should be displayed

  @AC02 @CT
  Scenario: Yes with a valid case reference saves and continues to rent frequency
    When I select "Yes" for the question "Has the tribunal previously determined the rent for your tenancy?"
    And I enter tribunal case reference number as "LON/00AD/SMO/2023/0002"
    And I click "Save and continue"
    Then the page URL should be "rent-payment-frequency"
    And the page should include "How often do you pay your rent?"
    When I click back link
    Then I check "Yes" is selected for the question "Has the tribunal previously determined the rent for your tenancy?"
    And the tribunal case reference number should be "LON/00AD/SMO/2023/0002"

  # Validation rules and error copy are TBC – update the examples and the error text once confirmed
  @AC03 @CT @wip
  Scenario Outline: Yes with an invalid case reference shows an error
    When I select "Yes" for the question "Has the tribunal previously determined the rent for your tenancy?"
    And I enter tribunal case reference number as "<reference>"
    And I click "Save and continue"
    Then an error summary should be displayed
    And an inline error should be displayed for the question "Has the tribunal previously determined the rent for your tenancy?"
    And the page should include "Has the tribunal previously determined the rent for your tenancy?"

    Examples:
      | reference |
      | TBC       |

  @AC04 @CT
  Scenario: Yes with no case reference saves and continues to rent frequency
    When I select "Yes" for the question "Has the tribunal previously determined the rent for your tenancy?"
    And I enter tribunal case reference number as ""
    And I click "Save and continue"
    Then the page URL should be "rent-payment-frequency"
    When I click back link
    Then I check "Yes" is selected for the question "Has the tribunal previously determined the rent for your tenancy?"
    And the tribunal case reference number should be ""

  @AC05 @CT
  Scenario: No saves and continues to rent frequency
    When I select "No" for the question "Has the tribunal previously determined the rent for your tenancy?"
    Then the tribunal case reference field should not be displayed
    When I click "Save and continue"
    Then the page URL should be "rent-payment-frequency"
    When I click back link
    Then I check "No" is selected for the question "Has the tribunal previously determined the rent for your tenancy?"

  # Error copy is TBC – swap these steps for the text-specific error steps once confirmed
  @AC06 @CT
  Scenario: No answer selected shows an error
    When I click "Save and continue"
    Then an error summary should be displayed
    And an inline error should be displayed for the question "Has the tribunal previously determined the rent for your tenancy?"
    And the page should include "Has the tribunal previously determined the rent for your tenancy?"
    And no option should be selected for the question "Has the tribunal previously determined the rent for your tenancy?"

  @AC07 @CT
  Scenario Outline: Save for later from a selected answer returns to the dashboard
    When I select "<answer>" for the question "Has the tribunal previously determined the rent for your tenancy?"
    And I click "Save for later"
    Then check that the user is redirected to the task-list citizen dashboard page
    When I click "Current rent, other costs and your proposed market rent"
    Then I check "<answer>" is selected for the question "Has the tribunal previously determined the rent for your tenancy?"

    Examples:
      | answer |
      | Yes    |
      | No     |

  @AC07 @CT
  Scenario: Save for later with a case reference keeps the reference
    When I select "Yes" for the question "Has the tribunal previously determined the rent for your tenancy?"
    And I enter tribunal case reference number as "LON/00AD/SMO/2023/0002"
    And I click "Save for later"
    Then check that the user is redirected to the task-list citizen dashboard page
    When I click "Current rent, other costs and your proposed market rent"
    Then the tribunal case reference number should be "LON/00AD/SMO/2023/0002"

  @AC07 @CT
  Scenario: Save for later with no answer returns to the dashboard
    When I click "Save for later"
    Then check that the user is redirected to the task-list citizen dashboard page
    When I click "Current rent, other costs and your proposed market rent"
    Then no option should be selected for the question "Has the tribunal previously determined the rent for your tenancy?"