@JIRA-TEST-KEY:HDPD-596 @regression
Feature: Tenancy start date
  As a citizen completing rent details
  I want to provide the start date of my current tenancy
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
    Then the page URL should be "current-tenancy-start-date"

  @AC1
  Scenario: Tenancy start date page content
    Then the page should include "When did your current tenancy start?"
    And the page should include "Enter the date in your tenancy agreement"
    And tenancy start date parts should be visible
    And I should see the button "Save and continue"
    And I should see the button "Save for later"

  @AC2
  Scenario: A valid past start date saves and continues to tenancy end date
    When I enter the date "31/05/2025" for the question "When did your current tenancy start?"
    And I click "Save and continue"
    Then the page URL should be "tenancy-end-date"
    And the page should include "When does your tenancy end?"
    When I click back link
    Then the tenancy start date should be "31/05/2025"

  @AC3
  Scenario: Save for later preserves the tenancy start date and returns to dashboard
    When I enter the date "31/05/2025" for the question "When did your current tenancy start?"
    And I click "Save for later"
    Then check that the user is redirected to the task-list citizen dashboard page
    When I click "Current rent, other costs and your proposed market rent"
    And I click "Save and continue"
    And I click "Save and continue"
    And I click "Save and continue"
    And I select "No" for the question "Does the rent include any charges for utilities?"
    And I click "Save and continue"
    Then the page URL should be "current-tenancy-start-date"
    And the tenancy start date should be "31/05/2025"

  @AC4
  Scenario: Missing all tenancy start date parts shows a linked error
    When I click "Save and continue"
    Then I should see an error summary link for "Tenancy start date must include a day, month and year"
    And I should see inline error "Tenancy start date must include a day, month and year" for the question "When did your current tenancy start?"
    And the page URL should be "current-tenancy-start-date"

  @AC4
  Scenario: Missing tenancy start day shows a linked error and is not saved
    When I enter date parts "", "05", and "2025" for tenancy start date
    And I click "Save and continue"
    Then I should see an error summary link for "Tenancy start date must include a day"
    And I should see inline error "Tenancy start date must include a day" for the question "When did your current tenancy start?"
    And the page URL should be "current-tenancy-start-date"
    When I click back link
    And I click "Save and continue"
    Then the tenancy start date fields should be empty

  @AC4
  Scenario: Missing tenancy start month shows a linked error and is not saved
    When I enter date parts "01", "", and "2025" for tenancy start date
    And I click "Save and continue"
    Then I should see an error summary link for "Tenancy start date must include a month"
    And I should see inline error "Tenancy start date must include a month" for the question "When did your current tenancy start?"
    And the page URL should be "current-tenancy-start-date"
    When I click back link
    And I click "Save and continue"
    Then the tenancy start date fields should be empty

  @AC4
  Scenario: Missing tenancy start year shows a linked error and is not saved
    When I enter date parts "01", "05", and "" for tenancy start date
    And I click "Save and continue"
    Then I should see an error summary link for "Tenancy start date must include a year"
    And I should see inline error "Tenancy start date must include a year" for the question "When did your current tenancy start?"
    And the page URL should be "current-tenancy-start-date"
    When I click back link
    And I click "Save and continue"
    Then the tenancy start date fields should be empty

  @AC4
  Scenario: An invalid tenancy start date shows a linked error and is not saved
    When I enter the date "31/02/2025" for the question "When did your current tenancy start?"
    And I click "Save and continue"
    Then I should see an error summary link for "Tenancy start date must be a real date"
    And I should see inline error "Tenancy start date must be a real date" for the question "When did your current tenancy start?"
    And the page URL should be "current-tenancy-start-date"
    When I click back link
    And I click "Save and continue"
    Then the tenancy start date fields should be empty

  @AC4
  Scenario: A future tenancy start date shows a linked error and is not saved
    When I enter the date "31/05/2099" for the question "When did your current tenancy start?"
    And I click "Save and continue"
    Then I should see an error summary link for "Tenancy start date must be in the past"
    And I should see inline error "Tenancy start date must be in the past" for the question "When did your current tenancy start?"
    And the page URL should be "current-tenancy-start-date"
    When I click back link
    And I click "Save and continue"
    Then the tenancy start date fields should be empty