@JIRA-TEST-KEY:HDPD-1045 @regression
Feature: Property Details - Tenant-Landlord Repairs 
  As a PT user completing the property details form
  I want to enter and validate the repairs that are the landlord's and tenant's responsibility
  So that the repairs information is correctly recorded as part of the property details

  Background:
        Given the user navigates to PT url
        And the user has successfully logged on to market-rent-determination application
        When user clicks on the my application link
        Then check that the user is redirected to the application-type page
        And I select the option "Challenge my rent as excessive within the first 6 months of the tenancy"
        And I click "Continue"
        Then check that the user is redirected to the "tenancy-type" page
        And I select the option "Assured periodic tenancy"
        And I click "Continue"
        When I click "Property details" link
        Then check that the user is redirected to the property-details page

    @JIRA-TEST-KEY:PTSD-813
    Scenario: Property Details - Tenant-Landlord Repairs - Enter and validate landlord and tenant repair responsibilities
        And I enter first line of address as "100"
        And I enter second line of address as "Test Street"
        And I enter town or city as "London"
        And I enter postcode as "E1 1AA"
        And I click "Save and continue"
        When I select "Fully detached house" for the question "What are you renting?"
        And I click "Save and continue"
        When I select "No" for the question "Do you have a floor plan of the property?"
        And I enter room sizes as "Room 1: 10x10, Room 2: 12x12" for the question "Tell us the number and type of rooms, and their sizes (optional)"
        And I click "Save and continue"
        And I click "Save and continue"
        When I select "No" for the question "Does the tenancy include any other facilities?"
        And I click "Save and continue"
        When I select "No" for the question "Do you share the property with your landlord?"
        And I click "Save and continue"
        And I click "Save and continue"
        And I click "Save and continue"
        And I select "No" for the question "Is furniture provided in your tenancy?"
        And I click "Save and continue"
        When I select "No" for the question "Are any services provided in your tenancy?"
        And I click "Save and continue"
        Then I enter "Whitegood Repairs Included" for the question "What repairs are the landlord's responsibility? (optional)"
        Then I click "Save and continue"
        And I click back link
        When I enter characters more than "600" in the description field for the question "What repairs are the landlord's responsibility? (optional)"
        And I click "Save and continue"
        Then I check that the error message "Enter a valid description of the repairs the landlord is responsible for" is displayed on the page
        And I click back link
        And I click "Save and continue"
        And I click "Save and continue"
        When I enter "Bathroom Repairs Takecare" for the question "What repairs are the tenant's responsibility? (optional)"
        Then I click "Save and continue"
        And I click back link
        When I enter characters more than "600" in the description field for the question "What repairs are the tenant's responsibility? (optional)"
        And I click "Save and continue"
        Then I check that the error message "Enter a valid description of the repairs the tenant is responsible for" is displayed on the page
        And I click back link
        And I click "Save and continue"
        And I click "Save and continue"
        Then I check that the user is redirected to the "repairs-and-improvements" page with heading "Repairs and improvements"