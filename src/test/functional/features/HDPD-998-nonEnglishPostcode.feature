@HDPD-998 @nonEnglishPostCode
Feature: Non-English postcode journey
As a citizen
I want to access the correct guidance for my country
So that I can continue with the appropriate service

  Background:
    Given I am on the "Sorry, this service is only available in England" page

  @AC1
  Scenario: AC1 - Scotland link navigation
    When I select scotland link
    Then I should be redirected rentalrights page

  @AC2
  Scenario: AC2 - Wales link navigation
    When I select wales link
    Then I should be redirected to notice-variation-rent-form
  @AC3
  Scenario: AC3 - Guidance on GOV.UK link navigation
    When I select the guidance gov.uk link
    Then I should be redirected to the GOV.UK guidance page
