"use client"

import Image from 'next/image';
import Tooltip from '@mui/material/Tooltip'; // Import MUI Tooltip
import Link from 'next/link'; // Import Link for navigation

const teamMembers = [    
    {
        name: "Madhih",
        photo: "/photo-madhih.png",
        description: "Madhih is an MSc student in Industry 4.0 with Graduate Certificate in Computing Foundations II, and holds a Bachelor of Science in Data Science and Analytics (Hons) from NUS. His comprehensive internship experiences in data science at DataSpark, TVS Motor, PSA Corporation, and Wärtsilä have equipped him with a diverse skill set applicable to various business problems. Madhih has a strong passion for leveraging data science to solve complex issues, with expertise in geospatial analysis, machine learning, predictive analytics, and AI-driven decision-making, all of which are crucial for Digital Trinity's development of predictive supply chain models for Micron."
    },    
    {
        name: "Shonn",
        photo: "/photo-shonn.png",
        description: "Shonn is an MSc candidate in Industry 4.0 with a Graduate Certificate in Computing Foundations II, building upon his Bachelor of Science in Data Science and Analytics (Hons) from NUS. His practical experience includes valuable Data Science Internships at PSA International and PSA BDP, providing him with insights into real-world data challenges. Shonn's core strengths lie in data analytics, natural language programming/GenAI, and a keen interest in applying and implementing machine learning tools, pipelines, and intelligent algorithms. He is dedicated to streamlining decision-making and optimizing business outcomes, making him a key contributor to Digital Trinity's AI-driven project for Micron"
    },
    {
        name: "Akbar",
        photo: "/photo-akbar.png",
        description: "Akbar is pursuing his MSc in Industry 4.0 with a Graduate Certificate in Computing Foundation II. With foundational degrees in Computer Science from the University of Indonesia and Information Technology from the University of Queensland, Akbar possesses a strong technical background. His extensive work experience as an Expert Engineer at Shopee Indonesia, UX Engineer Specialist at CT Corp Digital, and Principal Engineer at KASKUS highlights his proficiency in software development and user-centric design. Akbar's expertise in frontend engineering using React.js and UI design with Figma will be pivotal for Digital Trinity in developing intuitive and effective interfaces for Micron's predictive analytics solutions."
    },
    {
        name: "Marcus",
        photo: "/photo-marcus.png",
        description: "Marcus is an MSc candidate in Industry 4.0 pursuing a Graduate Certificate in Digital Supply Chain, which complements his Bachelor of Engineering in Chemical Engineering from NUS. His professional background includes roles as a Senior Process Engineer at Qualcomm and Clinical Marketing Lead at Endofotonics, where he honed his analytical and strategic thinking. For Digital Trinity, Marcus brings a keen ability to leverage data visualization techniques to craft compelling narratives for driving business decisions and excels at automating and streamlining business workflows, aiming to enhance operational efficiency for Micron."
    }
];

const features = [
    {
        title: "Waterfall Analysis",
        description: "This feature provides a detailed week-by-week breakdown of inventory changes, comparing planned supply and demand against actual purchase order receipts and consumption. It helps identify discrepancies, root causes for inventory imbalances (like inadequate PO coverage or demand spikes), and projects future inventory levels based on confirmed POs.",
        imageSrc: "/feature-waterfall.gif", // Replace with actual image path
        altText: "Waterfall Analysis Thumbnail"
    },
    {
        title: "Material Consumption Analysis",
        description: "This tool analyzes how materials are used over time, offering insights into overall consumption trends, identifying unusual spikes or drops (outliers), and allowing deep dives into specific materials. It can break down consumption by vendor, plant, and site, helping to understand usage patterns across different dimensions.",
        imageSrc: "/feature-waterfall.gif", // Replace with actual image path
        altText: "Material Consumption Analysis Thumbnail"
    },
    {
        title: "Order Placement Analysis",
        description: "This feature examines patterns in how purchase orders are created. It visualizes overall ordering trends, allows for analysis of specific materials, and can break down order quantities by supplier and plant. It also includes an ABC analysis to categorize materials based on their order value.",
        imageSrc: "/feature-waterfall.gif", // Replace with actual image path
        altText: "Order Placement Analysis Thumbnail"
    },
    {
        title: "Goods Receipt Analysis",
        description: "This focuses on the process of receiving materials, tracking quantities received over time. It highlights overall goods receipt patterns, detects outliers, and enables detailed analysis for specific materials, including trends and receipts by plant, site, and vendor.",
        imageSrc: "/feature-waterfall.gif", // Replace with actual image path
        altText: "Goods Receipt Analysis Thumbnail"
    },
    {
        title: "Lead Time Analysis",
        description: "This feature measures and analyzes the duration between placing an order and receiving the goods. It processes order placement and goods receipt data to calculate actual lead times, compares them against planned lead times, and provides summaries at both material and supplier levels to identify delays or inconsistencies.",
        imageSrc: "/feature-waterfall.gif", // Replace with actual image path
        altText: "Lead Time Analysis Thumbnail"
    },
    {
        title: "Forecast",
        description: "This capability predicts future material demand based on historical consumption data. Users can select different forecasting models (like XGBoost or ARIMA), specify the forecast period, and account for seasonality to generate demand projections for specific materials.",
        imageSrc: "/feature-waterfall.gif", // Replace with actual image path
        altText: "Forecast Thumbnail"
    },
    {
        title: "Inventory Simulation",
        description: "This tool runs Monte Carlo simulations to model inventory levels under various scenarios. It considers inputs like initial stock, reorder points, lead times, and demand variability (either fixed or based on statistical distributions). The simulation compares reactive versus proactive ordering strategies, highlighting potential stockout weeks and calculating Weeks of Stock to help optimize inventory policies.",
        imageSrc: "/feature-waterfall.gif", // Replace with actual image path
        altText: "Inventory Simulation Thumbnail"
    }
];

export default function AboutUsPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen relative z-10 py-10">
            <div className="w-full max-w-7xl flex flex-col px-4 pb-8">
                <div className="w-full max-w-7xl flex justify-start px-4 mb-4 py-4 mt-4"> {/* Container for the button */}
                    <Link href="/" legacyBehavior>
                        <a className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded">
                        « Back to Home
                        </a>
                    </Link>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-lg mb-4">
                    <div className="flex justify-center mb-10"> {/* Logo container */}
                        <Image
                            src="/logo-digital-trinity-primary.svg"
                            alt="Digital Trinity Logo"
                            width={300} // Adjust width as needed
                            height={150} // Adjust height as needed
                            priority // Add priority if it's an LCP element
                        />
                    </div>
                    <div className="font-bold text-2xl mt-2">About Digital Trinity</div> {/* Centered title */}
                    <div className="flex flex-col md:flex-row items-start mt-4 mb-4"> {/* Flex container for image and text */}
                        <div className="w-full md:w-2/5 mb-4 md:mb-0"> {/* Image container */}
                            <div className="relative aspect-[640/300]"> {/* Aspect ratio container */}
                                <Image
                                    src="/photo-group.jpg"
                                    alt="Digital Trinity Team Photo"
                                    fill
                                    objectFit='contain'
                                    className=""
                                />
                            </div>
                        </div>
                        <div className="w-full md:ml-6 md:w-3/5 text-lg"> {/* Text container */}
                            <strong>Digital Trinity</strong> is a dynamic team of Master of Science candidates in Industry 4.0 in NUS, collaborating as part of their IND5005B consulting project course. Focused on aiding Micron's digital evolution, the group is specifically tackling Proactive Supply Chain Risk Management: Leveraging AI for Predictive Weeks of Supply and Recovery Insights. By combining their diverse expertise in data science, engineering, and digital business strategy, Digital Trinity aims to deliver innovative, data-driven solutions that enhance Micron's operational resilience, predictive capabilities, and overall efficiency within its complex supply chain.
                        </div>
                    </div>
                    <div className="font-bold text-2xl mt-8 mb-6">Meet the Team</div>
                    <div className="grid grid-cols-2 md:grid-cols-4 justify-center gap-10 mb-6 ">
                        {teamMembers.map((member) => (
                            <div key={member.name}> {/* Adjust width as needed */}
                                <Tooltip                                     
                                    title={member.description} // Directly use the description string
                                    arrow
                                    placement="top"
                                    componentsProps={{ // Optional: for styling the tooltip directly if needed
                                        tooltip: {
                                            sx: {
                                                backgroundColor: 'black', // Example: change background color
                                                color: 'white', // Example: change text color
                                                fontSize: '0.875rem', // Example: change font size
                                                padding: '8px 12px', // Example: change padding
                                                maxWidth: 350, // Example: set max width
                                            },
                                        },
                                        arrow: {
                                            sx: {
                                                color: 'black', // Match arrow color with tooltip background
                                            },
                                        },
                                    }}
                                >
                                    <div className="flex flex-col items-center text-center cursor-pointer relative aspect-[3/5]"> {/* Added cursor-pointer */}                                        
                                        <Image
                                            src={member.photo}
                                            alt={`Photo of ${member.name}`}
                                            fill
                                            objectFit='contain'
                                            className="object-contain w-full h-full"
                                        />                                        
                                    </div>
                                </Tooltip>
                            </div>
                        ))}
                    </div>
                    <div className="font-bold text-2xl mt-8 mb-6">Company Overview</div>
                    <div className="text-lg mt-4 mb-4"><strong>Micron Technology</strong>, founded in 1978 in Boise, Idaho, has grown into a leading global manufacturer of memory and storage solutions, specializing in critical technologies like DRAM and NAND flash, with an extensive workforce of 43,000 employees across 17 countries. Their primary products, including DRAM (Dynamic Random Access Memory) and NAND Flash Memory SSDs (Solid-State Drives), are integral to a wide range of applications, powering consumer electronics, data centres, mobile devices, and automotive systems. Micron's robust market presence is demonstrated by its global operations, with major manufacturing, R&D, and sales facilities strategically located in the U.S., Taiwan, Singapore, Japan, and India, complemented by significant engineering, sales, and testing operations throughout Europe, China, and Malaysia.</div>
                    <div className="font-bold text-2xl mt-8 mb-6">Project Overview</div>
                    <div className="text-lg mt-4 mb-4">This project tackles the challenge of Micron's "Weeks of Supply" (WoS) metric, which currently offers descriptive insights into raw material inventory rather than proactive guidance for optimal levels amidst demand fluctuations. The project's scope includes simulating ideal inventory levels using Monte Carlo methods to mitigate stockouts and overstocking, optimizing order lead times through historical data analysis, and leveraging machine learning and time series models to predict WoS for proactive procurement, with a prototype developed in Streamlit and Plotly, eventually scaled to a Next.js application. Ultimately, the objective is to construct a data-driven simulation model for Micron's supply chain, utilizing historical data, ARIMA forecasting, Monte Carlo simulations, and reinforcement learning, culminating in an AI-powered dashboard that enables stakeholders to visualize demand and consumption patterns, facilitate inventory optimization, and make more informed strategic decisions.</div>
                    <div className="font-bold text-2xl mt-8 mb-6">Feature Overview</div>
                    <div>
                        {features.map((feature, index) => (
                            <div key={index} className="flex flex-col md:flex-row items-start mt-6 mb-8">
                                <div className="w-full md:w-1/4 mb-4 md:mb-0 md:mr-6 relative aspect-[160/90]"> {/* Image container - smaller width */}
                                    <Image
                                        src={feature.imageSrc}
                                        alt={feature.altText}
                                        fill
                                        objectFit='contain'
                                        className="shadow-md object-contain" // Added object-cover
                                    />
                                </div>
                                <div className="w-full md:w-3/4 text-lg"> {/* Text container */}
                                    <h3 className="font-semibold text-xl mb-2">{feature.title}</h3>
                                    <p>{feature.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}