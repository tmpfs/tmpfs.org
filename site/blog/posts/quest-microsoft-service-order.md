+++
created = 2022-12-17
title = "Quest for a Microsoft Service Order"
description = "The quest to create a Microsoft Service Order for a Surface Laptop 5"

[taxonomies]
tags = ["Microsoft", "Kafkaesque"]
+++

{{import "header"}}

On the 02/12/2022 I bought two laptops from the Challenger store in Singapore. One was a Surface Laptop Go 2 and the other was a Surface Laptop 5.

I finished the installation of Windows in store on both laptops and everything seemed to be working fine. However, when I got back to my country of residence and started to install software I quickly found out that the Surface Laptop 5 had a problem -- it kept crashing. The Surface Laptop Go 2 was working fine and I started to use it as intended.

The crash manifested as a freeze of input when the keyboard and trackpad would stop responding for several seconds and then either a shutdown or restart. Often a black line would appear on the screen while it was frozen.

* Exhibit A - [Purchase Receipt (pdf)](https://s3.ap-southeast-1.amazonaws.com/files.tmpfs.org/microsoft-quest/Laptops-receipt-challenger.pdf)

I installed all Windows (including firmware) updates hoping to resolve the issue but it still manifested after all availabel updates were installed.

I spent several hours debugging the problem to try to find out what was causing the error, I am not a Windows user or programmer but eventually I found the `eventvwr` program which let me see some information about the crash logs.

It had lots of entries for unexpected restarts for the crashes and some logs for a WHEA error. Looking online it appears this is to do with a hardware problem so I decided to create a service order to get the machine fixed or replaced.

Both laptops were registed with Microsoft and I went through the process as far as I could go to create a service order. Unfortunately, the service order process is broken, it finishes by indicating one should run the Surface diagnostics program and running the Surface diagnostics program at the end says to start a service order. So we have an infinite loop.

* Exhibit B - screenshots from the service order process:

![First Screen](https://s3.ap-southeast-1.amazonaws.com/files.tmpfs.org/microsoft-quest/001-Screenshot+2022-12-13+at+15-49-11+Microsoft+account+Devices.png)

![Second Screen](https://s3.ap-southeast-1.amazonaws.com/files.tmpfs.org/microsoft-quest/002-Screenshot+2022-12-13+at+15-50-36+Microsoft+account+Devices.png)

![Third Screen](https://s3.ap-southeast-1.amazonaws.com/files.tmpfs.org/microsoft-quest/003-Screenshot+2022-12-13+at+15-50-50+Microsoft+account+Devices.png)

![Fourth Screen](https://s3.ap-southeast-1.amazonaws.com/files.tmpfs.org/microsoft-quest/004-Screenshot+2022-12-13+at+15-51-06+Microsoft+account+Devices.png)

On the last screen after clicking the *Done* button the pop-up window disappears and nothing else happens.

I tried this several times (at least five times) but always with the same result. Some online research indicated I should use Microsoft Edge with an InPrivate windows, I tried that too but it was always the same result.

Callin the Microsoft support line and selecting the appropriate options yielded a message saying:

> We are experiening technical difficulties

And then promptly hung up on me; so it seems attempting to get support by telephone is not possible either.

I mistakenly thought that I would be able to get the machine serviced in Indonesia so I flew to Jakarta to go to the Microsoft office and request some help. However, they told me that it is not sold and cannot be serviced in Indonesia and that I would have to go to Singapore.

At this point I called the support line again and selected a *Sales* option as I rightly suspected that the sales line would not be experiencing technical difficulties. I spoke to an operator their who gave me their email address and I sent screenshots, after several emails back and forth they directed me to the support line which does not work.

So, hopefully, you see how it is essentially impossible to create a service order for a Microsoft Surface machine.

Whilst researching I noticed that there are no walk-in service centres in Singapore; only in the US, China and India; so quite possibly I could fly to Singapore and again be met with a lack of support.

At this point I don't see any other option then to apply to the Singapore [small claims tribunal](https://www.judiciary.gov.sg/civil/small-claims).

{{import "footer"}}
