@JIRA-TEST-KEY:HDPD-598 @regression
Feature: Current tenancy replaces an original tenancy
  As a citizen completing rent details
  I want to state whether my tenancy replaces an original tenancy
  So that the application records the correct tenancy history

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
    And I select "Yes" for the question "Has the tribunal previously determined the rent for your tenancy?"
    And I enter tribunal case reference number as "LON/00AD/SMO/2023/0002"
    And I click "Save and continue"
    And I select "Monthly" for the question "How often do you pay your rent?"
    And I enter "1000" for "monthly" rent amount
    And I click "Save and continue"
    And I select "No" for the question "Does your rent include council tax?"
    And I click "Save and continue"
    And I select "No" for the question "Does the rent include any charges for utilities?"
    And I click "Save and continue"
    And I enter the date "31/05/2025" for the question "When did your current tenancy start?"
    And I click "Save and continue"
    And I enter the date "31/05/2027" for the question "When does your tenancy end?"
    And I click "Save and continue"
    Then the page URL should be "current-tenancy-replace-original-tenancy"

  @AC1
  Scenario: Original tenancy page content
    Then the page should include "Does your current tenancy replace an original tenancy?"
    And the page should include "An original tenancy is the first assured shorthold tenancy given to you by the same landlord for the same property"
    And original tenancy options should appear in order
    And I should see the button "Save and continue"
    And I should see the button "Save for later"

  @AC2
  Scenario: Yes reveals the original tenancy date input group
    When I select "Yes" for the question "Does your current tenancy replace an original tenancy?"
    Then the page should include "When did your original tenancy start?"
    And original tenancy date parts should be visible

  @AC3
  Scenario: Yes with a valid date saves and continues to other charges
    When I select "Yes" for the question "Does your current tenancy replace an original tenancy?"
    And I enter the date "01/01/2025" for the question "When did your original tenancy start?"
    And I click "Save and continue"
    Then I check that the text "Are you charged separately for anything else?" is displayed on the page
    When I click back link
    Then I check "Yes" is selected for the question "Does your current tenancy replace an original tenancy?"
    And the original tenancy date should be "01/01/2025"

  @AC4
  Scenario Outline: No or not sure saves and continues without an original date
    When I select "<answer>" for the question "Does your current tenancy replace an original tenancy?"
    Then the original tenancy date field should not be displayed
    When I click "Save and continue"
    Then I check that the text "Are you charged separately for anything else?" is displayed on the page

    Examples:
      | answer        |
      | No            |
      | I'm not sure  |

  @AC5
  Scenario: Save for later preserves the original tenancy answer and date
    When I select "Yes" for the question "Does your current tenancy replace an original tenancy?"
    And I enter the date "01/01/2025" for the question "When did your original tenancy start?"
    And I click "Save for later"
    Then check that the user is redirected to the task-list citizen dashboard page
    When I click "Current rent, other costs and your proposed market rent"
    And I click "Save and continue"
    And I click "Save and continue"
    And I click "Save and continue"
    And I click "Save and continue"
    And I click "Save and continue"
    And I click "Save and continue"
    Then I check "Yes" is selected for the question "Does your current tenancy replace an original tenancy?"
    And the original tenancy date should be "01/01/2025"

  @AC6
  Scenario: Missing original tenancy answer shows a linked error and is not saved
    When I click "Save and continue"
    Then I should see an error summary link for "Select whether your current tenancy replaces an existing tenancy"
    And I should see inline error "Select whether your current tenancy replaces an existing tenancy" for the question "Does your current tenancy replace an original tenancy?"
    And the page URL should be "current-tenancy-replace-original-tenancy"
    And no option should be selected for the question "Does your current tenancy replace an original tenancy?"
    When I click back link
    And I click "Save and continue"
    Then no option should be selected for the question "Does your current tenancy replace an original tenancy?"

  @AC6
  Scenario Outline: Missing an original tenancy date part shows the corresponding error
    When I select "Yes" for the question "Does your current tenancy replace an original tenancy?"
    And I enter date parts "<day>", "<month>", and "<year>" for original tenancy
    And I click "Save and continue"
    Then I should see an error summary link for "<error>"
    And I should see inline error "<error>" for the question "When did your original tenancy start?"
    And the page URL should be "current-tenancy-replace-original-tenancy"
    When I click back link
    And I click "Save and continue"
    Then no option should be selected for the question "Does your current tenancy replace an original tenancy?"

    Examples:
      | day | month | year | error                                                 |
      |     | 05    | 2020 | Original tenancy start date must include a day        |
      | 01  |       | 2020 | Original tenancy start date must include a month      |
      | 01  | 05    |      | Original tenancy start date must include a year       |

  @AC6
  Scenario Outline: An invalid original tenancy date shows the date error
    When I select "Yes" for the question "Does your current tenancy replace an original tenancy?"
    And I enter the date "<date>" for the question "When did your original tenancy start?"
    And I click "Save and continue"
    Then I should see an error summary link for "<error>"
    And I should see inline error "<error>" for the question "When did your original tenancy start?"
    And the page URL should be "current-tenancy-replace-original-tenancy"
    When I click back link
    And I click "Save and continue"
    Then no option should be selected for the question "Does your current tenancy replace an original tenancy?"

    Examples:
      | date       | error                                                |
      | 31/02/2025 | Original tenancy start date must be a real date      |
      | 01/01/2099 | Original tenancy start date must be in the past      |