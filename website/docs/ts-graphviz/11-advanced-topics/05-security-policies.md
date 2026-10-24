---
description: Security policies for ts-graphviz.
---
# Security Policies

## Purpose and Importance

In today's software development landscape, **Open Source Software (OSS)** plays an indispensable role in building applications. According to the **Open Source Security Foundation (OpenSSF)**, **70% to 90%** of modern applications consist of OSS components[^1], and the complexity of their dependencies is increasing daily.

[^1]: Behlendorf, B. (2022, May 11). *Brian Behlendorf Testifies to Congress on Open Source Software Security* (original in English). The Linux Foundation. Retrieved from [https://www.linuxfoundation.org/blog/blog/lf/brian-behlendorf-testifies-open-source-software-security](https://www.linuxfoundation.org/blog/blog/lf/brian-behlendorf-testifies-open-source-software-security)

### The Impact and Responsibility of ts-graphviz

**ts-graphviz** is a widely used library with over 2 million downloads per month, impacting a broad range of applications. Even users who do not directly interact with ts-graphviz are affected through software that depends on it.

> ![Dependency](https://imgs.xkcd.com/comics/dependency.png)
>
> *An illustration of software dependencies (Source: [xkcd.com/2347](https://xkcd.com/2347/))*

This illustration highlights how modern software relies on numerous underlying components.

**Ensuring the security of ts-graphviz is crucial because vulnerabilities can cascade through dependencies, potentially affecting countless applications.**

## Commitment to Security

ts-graphviz is committed to more than just providing secure source code. We implement **comprehensive security measures** that consider the **entire software supply chain**. This dedication ensures that users can confidently adopt ts-graphviz, knowing it contributes to building secure and reliable applications.

## Software Supply Chain Security

Recognizing that modern applications are heavily dependent on open-source software, we implement practices that safeguard against vulnerabilities throughout the dependency chain.

## Reporting Vulnerabilities

We encourage users and security researchers to report any vulnerabilities or security concerns. Prompt reporting allows us to address issues swiftly, maintaining the integrity and security of the library.
