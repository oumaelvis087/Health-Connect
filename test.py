import scrape_hospital_data as shd


if __name__ == "__main__":
    url = "https://mtiba.com/find-a-clinic-near-me/"  # Replace with the actual URL
    hospitals = shd.scrape_hospital_data(url)
    print(hospitals)