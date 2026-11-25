@JIRA-TEST-KEY:HDPD-597 @regression
Feature: Tenancy end date
  As a citizen completing rent details
  I want to provide the end date of my current tenancy
  So that my application records the correct tenancy period

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
    Then the page URL should be "tenancy-end-date"

  @AC1
  Scenario: Tenancy end date page content
    Then I check that the text "When does your tenancy end?" is displayed on the page
    And tenancy end date parts should be visible
    And I should see the button "Save and continue"
    And I should see the button "Save for later"

  @AC2
  Scenario: A valid future end date saves and continues to original tenancy question
    When I enter the date "31/05/2027" for the question "When does your tenancy end?"
    And I click "Save and continue"
    Then the page URL should be "current-tenancy-replace-original-tenancy"
    And the page should include "Does your current tenancy replace an original tenancy?"
    When I click back link
    Then the tenancy end date should be "31/05/2027"

  @AC3
  Scenario: Save for later preserves the tenancy end date and returns to dashboard
    When I enter the date "31/05/2027" for the question "When does your tenancy end?"
    And I click "Save for later"
    Then check that the user is redirected to the task-list citizen dashboard page
    When I click "Current rent, other costs and your proposed market rent"
    And I click "Save and continue"
    And I click "Save and continue"
    And I click "Save and continue"
    And I select "No" for the question "Does the rent include any charges for utilities?"
    And I click "Save and continue"
    And I click "Save and continue"
    Then the page URL should be "tenancy-end-date"
    And the tenancy end date should be "31/05/2027"

  @AC4
  Scenario: Missing all tenancy end date parts shows a linked error
    When I click "Save and continue"
    Then I should see an error summary link for "Tenancy end date must include a day, month and year"
    And I should see inline error "Tenancy end date must include a day, month and year" for the question "When does your tenancy end?"
    And the page URL should be "tenancy-end-date"

  @AC4
  Scenario Outline: Missing a tenancy end date part shows its specific error
    When I enter date parts "<day>", "<month>", and "<year>" for tenancy end date
    And I click "Save and continue"
    Then I should see an error summary link for "<error>"
    And I should see inline error "<error>" for the question "When does your tenancy end?"
    And the page URL should be "tenancy-end-date"
    When I click back link
    And I click "Save and continue"
    Then the tenancy end date fields should be empty

    Examples:
      | day | month | year | error                              |
      |     | 05    | 2027 | Tenancy end date must include a day   |
      | 01  |       | 2027 | Tenancy end date must include a month |
      | 01  | 05    |      | Tenancy end date must include a year  |

  @AC4
  Scenario Outline: Invalid tenancy end date shows the matching date error
    When I enter the date "<date>" for the question "When does your tenancy end?"
    And I click "Save and continue"
    Then I should see an error summary link for "<error>"
    And I should see inline error "<error>" for the question "When does your tenancy end?"
    And the page URL should be "tenancy-end-date"
    When I click back link
    And I click "Save and continue"
    Then the tenancy end date fields should be empty

    Examples:
      | date       | error                                      |
      | 31/02/2027 | Tenancy end date must be a real date       |
      | 31/05/2025 | Tenancy end date must be in the future     |