# Urban Outlier



## Project Website

http://550.orifish.tech

It may take a while to load the page and data, please be patient!



## Team

Member: ZhaoZhen Xu, Xiong Zheng

Tutor: Nick Hand




## Project Description

Streets are the backbone of a city structure. Street qualities (including greening, accesses to transportation, demography, building, and public service etc. ) will greatly impact the safety and equity of the community living there. The project aims to proactively, using street view analysis, explore the relationships between "street space" and "safety" / "equity". We try to answer following questions in this project.
1. How does the street space quantitatively vary within Philadelphia?
2. Are there clustering for the street quality?
3. What is the relationship between races and their associated living streets? Does it achieve equity and where does the difference exist?
4. What is the relationship between crime occurrence and the quantity of living street elements? 
5. For specific crime types, which environment is easier to be effected?



## Method & Results

Compared to the traditional method which will use manually reported or collected datasets (e.g. 311 complaints dataset and house sales dataset). Our method is proactive because we do images analysis on the Street Views provided by the Internet company , whose images are evenly distributed within Philadelphia, preventing the effect of the broken window theory and optionally reported datasets. Broken window theory says people in different classes or communities in different condition will have various tendencies toward reporting and changing the situation.



#### 1. Street Component Analysis

##### a. Collection

The Bing Street View is collected by [Bing Developer Api](https://www.microsoft.com/en-us/maps/choose-your-bing-maps-api). This part of codes can be found [here](./data/streetview/streetViewDownloader.ipynb).

```python
def downloadImage(lon,lat):
    point = [f"{lon:.5f}" ,f"{lat:.5f}"]

    # request metadata Api
    url = apiEndpoint.replace("LAT",point[1]).replace("LON",point[0])
    h = requests.get(url)
    responseJson = h.json()
    ...
```

The images were taken by the Bing at 2015, and we wrapped each image every 100m. The location of the collection points and the example of wrapped image are mapped as follows.

<figure><center>
<img src="data/ppt/1.2.jpeg" alt="drawing" width="500"/>	     
<figcaption>Fig.1 - Street View Collection Points</figcaption>
</center></figure>


<figure><center>
<img src="data/ppt/streetview_example.jpg" alt="drawing" width="500"/>
<figcaption>Fig.2 - Sample of the Street View Collection Image</figcaption>
</center></figure>

##### b. Component Analysis

An image segmentation method `SegNet` is used to analyzing the elements and their proportion in the images, as described in *SegNet: A Deep Convolutional Encoder-Decoder Architecture for Image Segmentation Vijay Badrinarayanan, Alex Kendall and Roberto Cipolla, PAMI 2017 [http://arxiv.org/abs/1511.00561]* The implication of SegNet in this project is heavliy based on https://github.com/GeorgeSeif/Semantic-Segmentation-Suite.


Here is a sample of the segmentation output.

<figure><center>
<img src="data/ppt/streetview_pro_example.png" alt="drawing" width="500"/>
<figcaption>Fig.3 - Sample of the Street View Collection Image</figcaption>
</center></figure>

We then count the pixel number of each segment (each color), and calculate the proportion of each segment by dividing the total pixel number.

| pointId | Animal | Archway | Bicyclist | Bridge | Building |    Car | CartLuggagePram |  ... |
| ------: | -----: | ------: | --------: | -----: | -------: | -----: | --------------: | ---: |
|  641548 |  10394 |       4 |        57 |    513 |     3961 | 185859 |            6573 |  ... |
|  640416 |   1313 |       1 |         0 |   2348 |     3583 | 339775 |            6591 |  ... |
|  620130 |   7230 |       1 |        37 |   1012 |      143 | 179598 |            9079 |  ... |
|  401340 |   9336 |       0 |         0 |   1454 |      733 | 204396 |           27068 |  ... |
|  761434 |   6817 |       8 |         9 |     75 |      876 | 127222 |           51155 |  ... |
|     ... |    ... |     ... |       ... |    ... |      ... |    ... |             ... |  ... |

<center>Table.1 - Counting the pixel number of each segment</center>

Then, we combined the output elements into ten categories (Green, Wall, Lives, Building, Infrastructure, Road, Sidewalk, Sky, Transportation, and Public service), which will make the analysis more concise and intuitive. 

| Categories     | Components                                                                |
| -------------- | ------------------------------------------------------------------------- |
| Wall           | Column_Pole + Fence + Wall + TrafficCone                                  |
| Lives          | Animal + Bicyclist + Child + Pedestrain + MotorcycleScooter + otherMoving |
| Building       | Archway + Building                                                        |
| Infrastructure | Bridge + ParkingBlock + Train + Tunnel                                    |
| Road           | Road + RoadShoulder + LaneMkgsDriv+ LaneMkgsNonDriv                       |
| Sidewalk       | Sidewalk                                                                  |
| Sky            | Sky                                                                       |
| Green          | Tree + VegetationMisc                                                     |
| Transportation | Car + SUVPickupTruck + Truck_Bus                                          |
| PublicService  | CartLuggagePram + SignSymbol + TrafficLight                               |

<center>Table.2 - Components and Catefories</center>



##### c. Visualization & Result

We plot each category of street view point in the map of Philadelphia, using color to represents the proportion. The purple represents a low proportion and the yellow represents a high proportion. The technical platforms used here are leaflet (to make the map) and the html language (to make the interactive buttons). 

<figure><center>
<img src="data/ppt/component.jpg" alt="drawing" width="500"/>
<figcaption>Fig.4 - Visualization of Component Analysis Image</figcaption>
</center></figure>

From the map, we can learn that for the greening, the street in the north-west and north-east areas have a higher greening proportion. As for the wall, which may represent the defense level of a street, west and mid Philadelphia have higher proportions. For the active lives and buildings on the street, mid and south Philadelphia have higher proportions, which may be the outcome of the high dense population. And the Center City and south Philadelphia, which are main commercial areas of Philadelphia, have more sidewalks and cars on the street; while it is more easy to see the sky in the east-north Philadelphia.




#### 2. Clustering for street views

##### a. Clustering Analysis

Based on the above street element outcome, KMeans Clustering Method is used to find concise descriptions of these elements. After attempts, we set the clustering number as four. 

<figure><center>
<img src="data/ppt/clustering.jpg" alt="drawing" width="500"/>
<figcaption>Fig.5 - Visualization of Clustering map</figcaption>
</center></figure>
Interestingly, even though we did not include the geometry feature when doing the clustering analysis, it still represents spatial clustering feature. This may because of the administration unit division and community segregation. Adjacent streets will receive similar urban administration resource and attract similar population.`

##### b. Visualization & Result

We use bar diagram to display the quantitative difference between each category. The quantitative diagram for these clustering is as follows. 

<figure><center>
<img src="data/ppt/clusteringDiagram.jpg" alt="drawing" width="800"/>
<figcaption>Fig.6 - Visualization of Clustering Diagram</figcaption>
</center></figure>



Based on above quantitative diagram. We attach labels to these four categories, which may describe the feature of these clustering. The labels are as follow.

**`1: High-density`** 

This clustering mainly distributes at the center city which is the most prosperous area in Philadelphia, and it has more buildings, less green, and more openness (less wall and more road) compared to other areas.

**`2: Lush`**

This clustering mainly distributes at the west and mid-north Philadelphia. The features of this clustering are low building density, high street greening, and wide road.

**`3: Spacious`**

This clustering distributes around large natural parks. And besides this, it has relatively less buildings. These two indicated that it is easier to see the sky in the street, which also validated by the analysis. And also this category has more walls, less open to the public compared to other areas.

**`4: Townhouse`**

As this name, townhouse, indicates, the mainly building type within this clustering is townhouse. Therefore, this clustering has more greening, which is mainly made up of private lawns and gardens of townhouses, and less road.



#### 3. Relationship between Street Component & Race

##### a. Data Collection & Wrangling

Aside from the element dataset obtained from the above procedure, a dataset of demography is collected. We use the ACS api `acs.query`to collect the demography data of 2015, and calculate the white population percentage of each census block group. Also, its corresponding geometry is obtained from `acs.set_mapservice`, and merged with the previous dataset. After this, we use `gpd.sjoin` to join the census white population percentage data with the street view dataset. In the end, a dataset with street element for all collection points and its related demography dataset is obtained.

##### b. Visualization & Result

The map of race distribution is listed below. From the map, we can see the high-white-percentage communities are mainly distributed at the north-west, north-east and south Philadelphia.
<figure><center>
<img src="data/ppt/raceDistribution.jpg" alt="drawing" width="500"/>
<figcaption>Fig.7 - Visualization of Race Distribution map</figcaption>
</center></figure>


Corresponding to the above map, an area chart is used to display the change of each street element with the percentage of white population increased. 

<figure><center>
<img src="data/ppt/elementWithRace.jpg" alt="drawing" width="700"/>
<figcaption>Fig.8 - Visualization of White PPL % and Street Component</figcaption>
</center></figure>



From the graph, we can see that when the percentage of the white are at the mid-range, the street will have more buildings, lives, public service and transportation. That means a mixed community will bring vitality to the street, and we should encourage the confusion. However, we also see the mid-and-high-white communities enjoy more greening-and-open streets while the low-white communities have less green, more wall, roads and transportation. Since we only analyze the street element, there are many other factors not being taken into account and we can not simply draw the conclusion. But these indicator indicate there is difference for street quality among different white percentage community.

#### 4. Relationship between Street Component & Crime

##### a. Data Collection & Wrangling

Aside from the element dataset obtained from the above procedure, a dataset of crime incident is also collected. We use the api provided by the OpenDataPhilly to collect the crime incidents from 2015-01-01 to 2016-01-01. And we also aggregate the occurring number by crime type to select the Top 20 for further analysis. The following is the bar plot of aggregated crime occurring number. 

<figure><center>
<img src="data/ppt/crimeselection.png" alt="drawing" width="600"/>
<figcaption>Fig.8 - Aggregated Crime Occurring Number</figcaption>
</center></figure>

After this, we count the incidents of selected crime types within the 100 meter buffer of each street view collection point, using the method of `buffer` and `gpd.sjoin`. In the end, we get a dataset which has each street element proportion and its aggregated crime count.

##### b. Regression and Visualization

<figure><center>
<img src="data/ppt/Scatterplot.jpg" alt="drawing" width="600"/>
<figcaption>Fig.9 - Relationship between each street component and crime incident</figcaption>
</center></figure>

Altair scatter plot is used to present the correlation between each street element and crime incident. To further examine the relationship, we use the `sm.OLS` to run the regression, where the crime count is the dependent variable and the street elements are the independent variables. This regression's aim is not to accurately predict the crime count, but to see the coefficient of each independent variable to the crime count. (Due to some confidence interval cross over "0", even these `Building`, `Road`, and `Sidewald` variables have negative coefficient in the regression model, they display a positive relationship in the scatter plot)

| Element        | Coefficient | Confidence Interval |
| -------------- | ----------- | ------------------- |
| Wall           | 0.217647    | (-5.840 , 6.276)    |
| Lives          | 10.409833   | (4.331 , 16.489)    |
| Building       | -7.1996504  | (-20.169 , 5.769)   |
| Infrastructure | -4.0176545  | (-9.604 , 1.569)    |
| Road           | -4.1585966  | (-11.021 , 2.704)   |
| Sidewalk       | -3.1852387  | (-8.502 , 2.132)    |
| Sky            | -39.7762518 | (-48.509 , -31.044) |
| Green          | -61.2810289 | (-75.801 , -46.761) |
| Transportation | 4.29717610  | (-1.347 , 9.941)    |
| Public service | 71.491967   | (46.378 , 96.606)   |
<center>Table.3 - Regression Result</center>



<figure><center>
<img src="data/ppt/confidence_Interval.png" alt="drawing" width="600"/>
<figcaption>Fig.10 - Confidence Interval for each component</figcaption>
</center></figure>


#### 5. Relationship Between Different Types of Crime and Street Space 

In order to further explore the relationship between different types of crime and street space, we have made a Parallel Map. In the plot, the x axis is the category of street elements, and the y axis is the proportion of street elements after standardization. Each line represents a crime record in Philadelphia in 2015, and its color is determined by the type of crime.

<figure><center>
<img src="data/ppt/final.jpg" alt="drawing" width="700"/>
<figcaption>Fig.11 - Street Space and Different Types of Crime</figcaption>
</center></figure>



We can know from the figure that the street space where different types of crimes occur is different. Similar to the previous results, some elements, such as greening, sky are more closely related to crime types. For example, comparing Aggravated Assault Firearm and Drug Law Violation (displayed in the diagram), it can be found that drug related violations usually occur in streets with less greenery, fewer people, and less infrastructure.



## Used Datasets

| Dataset          | Description                                                  | Source                 |
| ---------------- | ------------------------------------------------------------ | ---------------------- |
| Bing Street View | 12000+ street view pics for Philadelphia                     | Bing Street View(2015) |
| Street           | Street center line                                           | OpenDataPhilly         |
| ACS 2015         | Race and demography in 2015                                  | Census Bureau          |
| Crime Incidents  | Crime incidents from the Philadelphia Police Department in 2015 | OpenDataPhilly         |