class HesaplamaMotoru:
    def __init__(self, avg_fuel_consumption=10.0, meat_emission_factor=15.0, vegan_emission_factor=2.0):
        self.avg_fuel = avg_fuel_consumption
        self.meat_factor = meat_emission_factor
        self.vegan_factor = vegan_emission_factor
        self.co2_per_liter_petrol = 2.31  # kg CO2/Litre benzin
        self.co2_per_liter_diesel = 2.68  # kg CO2/Litre dizel
        self.co2_per_kwh = 0.45           # Ortalama şebeke elektriği katsayısı (kg CO2/kWh)

    def calculate_actual_weekly_kg(self, user_input):
        """
        API sözleşmesinden gelen tüm anlık verileri kullanarak, kural tabanlı deterministik
        gerçek (actual) haftalık kg CO2 miktarını hesaplar.
        """
        total_weekly_co2 = 0.0

        # 1. Ulaşım Hesabı (Aylık mesafe haftalığa çevriliyor)
        weekly_km = user_input.get('vehicle_distance_km_month', 0) / 4.345
        vehicle_type = user_input.get('vehicle_type', 'none').lower()

        if vehicle_type == 'petrol':
            total_weekly_co2 += (weekly_km / 100) * self.avg_fuel * self.co2_per_liter_petrol
        elif vehicle_type == 'diesel':
            total_weekly_co2 += (weekly_km / 100) * self.avg_fuel * self.co2_per_liter_diesel
        elif vehicle_type == 'hybrid':
            total_weekly_co2 += (weekly_km / 100) * (self.avg_fuel * 0.6) * self.co2_per_liter_petrol

        # 2. Beslenme Hesabı (Ortalama insan haftada 14 kg yemek yer varsayımıyla)
        diet = user_input.get('diet', 'mixed').lower()
        if diet == 'vegan':
            total_weekly_co2 += 14 * self.vegan_factor
        elif diet == 'vegetarian' or diet == 'pescatarian':
            total_weekly_co2 += 14 * ((self.vegan_factor + self.meat_factor) / 3)
        else: # omnivore / mixed
            total_weekly_co2 += 14 * ((self.vegan_factor + self.meat_factor) / 2)

        # 3. Atık (Waste) Hesabı
        bag_size_map = {'small': 1, 'medium': 2, 'large': 3, 'extra_large': 4}
        bag_size_str = user_input.get('waste_bag_size', 'medium').lower()
        bag_multiplier = bag_size_map.get(bag_size_str, 2)
        bag_count = user_input.get('waste_bag_weekly_count', 0)
        total_weekly_co2 += (bag_count * bag_multiplier * 1.5)

        # 4. Market / Alışveriş Hesabı (Aylık faturayı haftalığa çevirip dolaylı karbon katma)
        monthly_grocery = user_input.get('monthly_grocery_bill', 0)
        weekly_grocery = monthly_grocery / 4.345
        total_weekly_co2 += weekly_grocery * 0.15 

        # 5. Dijital / Ekran Kullanımı Hesabı (Günlük saatleri haftalığa çevirip elektrik emisyonu ekleme)
        daily_tv_pc = user_input.get('tv_pc_daily_hour', 0)
        daily_internet = user_input.get('internet_daily_hour', 0)
        total_daily_screen = daily_tv_pc + (daily_internet * 0.5)
        weekly_screen_hours = total_daily_screen * 7
        screen_kwh = weekly_screen_hours * 0.15
        total_weekly_co2 += screen_kwh * self.co2_per_kwh

        return round(total_weekly_co2, 2)
